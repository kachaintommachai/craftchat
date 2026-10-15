use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo};
use std::collections::HashMap;
use std::error::Error;
use tokio::sync::mpsc;
use crate::storage::Database;

pub const SERVICE_TYPE: &str = "_lan-line._tcp.local.";

#[derive(Debug, Clone)]
pub enum DiscoveryEvent {
    Discovered {
        peer_id: String,
        name: String,
        ip: String,
        port: u16,
        pubkey: String,
    },
    Offline {
        peer_id: String,
    },
}

pub struct DiscoveryManager {
    mdns: ServiceDaemon,
    registered_instance: Option<String>,
}

impl DiscoveryManager {
    pub fn new() -> Result<Self, Box<dyn Error + Send + Sync>> {
        let mdns = ServiceDaemon::new()?;
        Ok(Self {
            mdns,
            registered_instance: None,
        })
    }

    pub fn register(
        &mut self,
        peer_id: &str,
        display_name: &str,
        port: u16,
        pubkey: &str,
    ) -> Result<(), Box<dyn Error + Send + Sync>> {
        let host_name = format!("{}.local.", peer_id);
        let instance_name = peer_id;

        let mut properties = HashMap::new();
        properties.insert("name".to_string(), display_name.to_string());
        properties.insert("pubkey".to_string(), pubkey.to_string());
        properties.insert("peer_id".to_string(), peer_id.to_string());

        let service_info = ServiceInfo::new(
            SERVICE_TYPE,
            instance_name,
            &host_name,
            "",
            port,
            properties,
        )?;

        self.mdns.register(service_info)?;
        self.registered_instance = Some(instance_name.to_string());
        Ok(())
    }

    pub fn start_browsing(
        &self,
        event_sender: mpsc::UnboundedSender<DiscoveryEvent>,
        db: Database,
        my_peer_id: String,
    ) -> Result<(), Box<dyn Error + Send + Sync>> {
        let receiver = self.mdns.browse(SERVICE_TYPE)?;

        tokio::spawn(async move {
            while let Ok(event) = receiver.recv_async().await {
                match event {
                    ServiceEvent::ServiceResolved(info) => {
                        let peer_id = info
                            .get_property_val_str("peer_id")
                            .unwrap_or_else(|| info.get_fullname());

                        if peer_id == my_peer_id {
                            continue;
                        }

                        let display_name = info
                            .get_property_val_str("name")
                            .unwrap_or("Unknown Node");
                        let pubkey = info.get_property_val_str("pubkey").unwrap_or("");
                        let port = info.get_port();

                        let ips: Vec<String> = info
                            .get_addresses()
                            .iter()
                            .map(|ip| ip.to_string())
                            .collect();

                        let chosen_ip = ips.first().cloned().unwrap_or_else(|| "127.0.0.1".into());

                        let _ = db.upsert_peer(&peer_id, display_name, &chosen_ip, port, pubkey);

                        let _ = event_sender.send(DiscoveryEvent::Discovered {
                            peer_id: peer_id.to_string(),
                            name: display_name.to_string(),
                            ip: chosen_ip,
                            port,
                            pubkey: pubkey.to_string(),
                        });
                    }
                    ServiceEvent::ServiceRemoved(_, fullname) => {
                        let _ = event_sender.send(DiscoveryEvent::Offline {
                            peer_id: fullname,
                        });
                    }
                    _ => {}
                }
            }
        });

        Ok(())
    }
}
