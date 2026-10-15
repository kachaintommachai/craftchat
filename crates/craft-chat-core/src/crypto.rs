use chacha20poly1305::{
    aead::{Aead, KeyInit},
    XChaCha20Poly1305, XNonce,
};
use rand::rngs::OsRng;
use rand::RngCore;
use std::error::Error;
use x25519_dalek::{PublicKey, StaticSecret};

pub struct KeyPair {
    pub secret: StaticSecret,
    pub public: PublicKey,
}

impl KeyPair {
    pub fn generate() -> Self {
        let secret = StaticSecret::random_from_rng(OsRng);
        let public = PublicKey::from(&secret);
        Self { secret, public }
    }

    pub fn from_bytes(bytes: [u8; 32]) -> Self {
        let secret = StaticSecret::from(bytes);
        let public = PublicKey::from(&secret);
        Self { secret, public }
    }

    pub fn public_hex(&self) -> String {
        hex::encode(self.public.as_bytes())
    }
}

pub fn compute_shared_secret(
    our_secret: &StaticSecret,
    their_public_bytes: &[u8; 32],
) -> [u8; 32] {
    let their_public = PublicKey::from(*their_public_bytes);
    let shared = our_secret.diffie_hellman(&their_public);
    *shared.as_bytes()
}

pub fn encrypt_payload(
    shared_key: &[u8; 32],
    plaintext: &[u8],
) -> Result<(Vec<u8>, [u8; 24]), Box<dyn Error + Send + Sync>> {
    let cipher = XChaCha20Poly1305::new(shared_key.into());
    let mut nonce_bytes = [0u8; 24];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = XNonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("Encryption error: {:?}", e))?;

    Ok((ciphertext, nonce_bytes))
}

pub fn decrypt_payload(
    shared_key: &[u8; 32],
    ciphertext: &[u8],
    nonce_bytes: &[u8; 24],
) -> Result<Vec<u8>, Box<dyn Error + Send + Sync>> {
    let cipher = XChaCha20Poly1305::new(shared_key.into());
    let nonce = XNonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption error: {:?}", e))?;

    Ok(plaintext)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_e2ee_key_exchange_and_encryption() {
        let alice = KeyPair::generate();
        let bob = KeyPair::generate();

        let alice_shared = compute_shared_secret(&alice.secret, bob.public.as_bytes());
        let bob_shared = compute_shared_secret(&bob.secret, alice.public.as_bytes());

        assert_eq!(alice_shared, bob_shared);

        let msg = b"Hello from LAN Peer! E2EE Test";
        let (ciphertext, nonce) = encrypt_payload(&alice_shared, msg).unwrap();
        let decrypted = decrypt_payload(&bob_shared, &ciphertext, &nonce).unwrap();

        assert_eq!(msg.to_vec(), decrypted);
    }
}
