import React, { useState } from 'react';
import { Smile, Sparkles, Heart, Flame, ThumbsUp, Coffee, Moon, Frown, Award, Search, X, MessageSquare } from 'lucide-react';

export interface StickerItem {
  id: string;
  name: string;
  category: 'anger' | 'love' | 'thanks' | 'happy' | 'cry' | 'sorry' | 'ok' | 'shock' | 'sleep' | 'food' | 'fighting' | 'bye' | 'vector' | 'flaticon';
  categoryName: string;
  packageId?: number;
  stickerId?: number;
  keywords: string[];
  render: (size?: number) => React.ReactNode;
}

// Helper to render official LINE sticker with local asset and CDN fallback
export const renderLineSticker = (stickerId: number | string, name: string, size = 120) => {
  const localUrl = `/stickers/${stickerId}.png`;
  const cdnUrl = `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerId}/android/sticker.png`;

  return (
    <img
      src={localUrl}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={(e) => {
        // Fallback to official LINE CDN if local cache missing
        if (e.currentTarget.src !== cdnUrl) {
          e.currentTarget.src = cdnUrl;
        }
      }}
      className="object-contain drop-shadow-sm select-none pointer-events-none transition-transform"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

// Helper to render Flaticon message sticker with local asset and CDN fallback
export const renderFlaticonSticker = (stickerId: string | number, name: string, size = 120) => {
  const idStr = stickerId.toString().replace('fl_', '');
  const localUrl = `/stickers/flaticon/${idStr}.png`;
  const folder = idStr.length > 3 ? idStr.slice(0, -3) : idStr;
  const cdnUrl = `https://cdn-icons-png.flaticon.com/512/${folder}/${idStr}.png`;

  return (
    <img
      src={localUrl}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={(e) => {
        // Fallback to Flaticon CDN if local cache missing
        if (e.currentTarget.src !== cdnUrl) {
          e.currentTarget.src = cdnUrl;
        }
      }}
      className="object-contain drop-shadow-sm select-none pointer-events-none transition-transform"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

// Official LINE stickers extracted directly from https://developers.line.biz/en/docs/messaging-api/sticker-list/#sticker-definitions
export const OFFICIAL_LINE_STICKERS: StickerItem[] = [
  // ================= 1. ความโกรธ / ANGER (โกรธ, โมโห, เดือด, ไฟลุก, งอน) =================
  {
    id: 'line_10858',
    name: 'แซลลี่ โมโหจัด',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 789,
    stickerId: 10858,
    keywords: ['โกรธ', 'โมโห', 'เดือด', 'เกรี้ยวกราด', 'angry', 'mad', 'rage', 'furious'],
    render: (size = 120) => renderLineSticker(10858, 'แซลลี่ โมโหจัด', size),
  },
  {
    id: 'line_10862',
    name: 'แซลลี่ โกรธไฟลุก',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 789,
    stickerId: 10862,
    keywords: ['โกรธ', 'โมโห', 'ไฟลุก', 'เดือดปุดๆ', 'angry', 'burn', 'fire', 'hot'],
    render: (size = 120) => renderLineSticker(10862, 'แซลลี่ โกรธไฟลุก', size),
  },
  {
    id: 'line_10874',
    name: 'แซลลี่ งอนหน้าบูด',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 789,
    stickerId: 10874,
    keywords: ['โกรธ', 'งอน', 'หน้าบึ้ง', 'หน้าบูด', 'หงุดหงิด', 'sulking', 'annoyed', 'mad'],
    render: (size = 120) => renderLineSticker(10874, 'แซลลี่ งอนหน้าบูด', size),
  },
  {
    id: 'line_1991',
    name: 'มูน ควันออกหู',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 446,
    stickerId: 1991,
    keywords: ['โกรธ', 'โมโห', 'ควันออกหู', 'ฉุน', 'เดือด', 'angry', 'mad'],
    render: (size = 120) => renderLineSticker(1991, 'มูน ควันออกหู', size),
  },
  {
    id: 'line_17842',
    name: 'มูน โกรธกัดฟัน',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 1070,
    stickerId: 17842,
    keywords: ['โกรธ', 'โมโห', 'กัดฟัน', 'ไม่ยอม', 'เคือง', 'angry', 'mad'],
    render: (size = 120) => renderLineSticker(17842, 'มูน โกรธกัดฟัน', size),
  },
  {
    id: 'line_10551379',
    name: 'ตัวละคร LINE ทุบโต๊ะโมโห',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 6136,
    stickerId: 10551379,
    keywords: ['โกรธ', 'โมโห', 'ทุบโต๊ะ', 'ไม่พอใจ', 'เดือด', 'angry', 'mad'],
    render: (size = 120) => renderLineSticker(10551379, 'ตัวละคร LINE ทุบโต๊ะโมโห', size),
  },
  {
    id: 'line_10979907',
    name: 'บราวน์ & โคนี่ งอนตุ๊บป่อง',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 6325,
    stickerId: 10979907,
    keywords: ['โกรธ', 'งอน', 'เคือง', 'หน้าบึ้ง', 'sulking', 'mad'],
    render: (size = 120) => renderLineSticker(10979907, 'บราวน์ & โคนี่ งอนตุ๊บป่อง', size),
  },
  {
    id: 'line_16581267',
    name: 'LINE พลุ่งพล่าน โมโหมาก',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 8522,
    stickerId: 16581267,
    keywords: ['โกรธ', 'โมโห', 'ไม่ไหวแล้ว', 'เดือด', 'ระเบิด', 'angry', 'furious'],
    render: (size = 120) => renderLineSticker(16581267, 'LINE พลุ่งพล่าน โมโหมาก', size),
  },
  {
    id: 'line_52002737',
    name: 'บราวน์ & แซลลี่ ดุ๊กดิ๊กไฟลุก',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    packageId: 11537,
    stickerId: 52002737,
    keywords: ['โกรธ', 'โมโห', 'ไฟลุก', 'เดือด', 'angry', 'fire'],
    render: (size = 120) => renderLineSticker(52002737, 'บราวน์ & แซลลี่ ดุ๊กดิ๊กไฟลุก', size),
  },

  // ================= 2. ความรัก / LOVE (รัก, หัวใจ, คิดถึง, เลิฟ, ชอบ, จุ๊บ) =================
  {
    id: 'line_10856',
    name: 'แซลลี่ ตาเป็นประกายหัวใจ',
    category: 'love',
    categoryName: 'รัก / หวาน',
    packageId: 789,
    stickerId: 10856,
    keywords: ['รัก', 'หัวใจ', 'ชอบ', 'เลิฟ', 'หลง', 'love', 'heart', 'crush'],
    render: (size = 120) => renderLineSticker(10856, 'แซลลี่ ตาเป็นประกายหัวใจ', size),
  },
  {
    id: 'line_10868',
    name: 'แซลลี่ ส่งจูบหวาน',
    category: 'love',
    categoryName: 'รัก / หวาน',
    packageId: 789,
    stickerId: 10868,
    keywords: ['รัก', 'จุ๊บ', 'จูบ', 'คิดถึง', 'เลิฟ', 'kiss', 'love', 'miss'],
    render: (size = 120) => renderLineSticker(10868, 'แซลลี่ ส่งจูบหวาน', size),
  },
  {
    id: 'line_10873',
    name: 'แซลลี่ กอดหัวใจโต',
    category: 'love',
    categoryName: 'รัก / หวาน',
    packageId: 789,
    stickerId: 10873,
    keywords: ['รัก', 'หัวใจ', 'กอด', 'แฟน', 'รักนะ', 'love', 'heart', 'hug'],
    render: (size = 120) => renderLineSticker(10873, 'แซลลี่ กอดหัวใจโต', size),
  },
  {
    id: 'line_1989',
    name: 'มูน วิ้งๆ ตาวาว',
    category: 'love',
    categoryName: 'รัก / หวาน',
    packageId: 446,
    stickerId: 1989,
    keywords: ['รัก', 'ชอบ', 'หลงรัก', 'ปิ๊ง', 'love', 'crush'],
    render: (size = 120) => renderLineSticker(1989, 'มูน วิ้งๆ ตาวาว', size),
  },
  {
    id: 'line_17840',
    name: 'มูน หัวใจระรัว',
    category: 'love',
    categoryName: 'รัก / หวาน',
    packageId: 1070,
    stickerId: 17840,
    keywords: ['รัก', 'หัวใจ', 'เลิฟ', 'แฟน', 'love', 'heart'],
    render: (size = 120) => renderLineSticker(17840, 'มูน หัวใจระรัว', size),
  },
  {
    id: 'line_10979904',
    name: 'บราวน์ & โคนี่ กอดกันแน่น',
    category: 'love',
    categoryName: 'รัก / หวาน',
    packageId: 6325,
    stickerId: 10979904,
    keywords: ['รัก', 'กอด', 'แฟน', 'คิดถึง', 'love', 'hug', 'miss'],
    render: (size = 120) => renderLineSticker(10979904, 'บราวน์ & โคนี่ กอดกันแน่น', size),
  },
  {
    id: 'line_10979905',
    name: 'บราวน์ & โคนี่ จุ๊บแก้ม',
    category: 'love',
    categoryName: 'รัก / หวาน',
    packageId: 6325,
    stickerId: 10979905,
    keywords: ['รัก', 'จุ๊บ', 'หอมแก้ม', 'แฟน', 'kiss', 'love'],
    render: (size = 120) => renderLineSticker(10979905, 'บราวน์ & โคนี่ จุ๊บแก้ม', size),
  },
  {
    id: 'line_52002734',
    name: 'บราวน์ & โคนี่ หัวใจลอย',
    category: 'love',
    categoryName: 'รัก / หวาน',
    packageId: 11537,
    stickerId: 52002734,
    keywords: ['รัก', 'หัวใจ', 'หวาน', 'เลิฟ', 'love', 'sweet'],
    render: (size = 120) => renderLineSticker(52002734, 'บราวน์ & โคนี่ หัวใจลอย', size),
  },

  // ================= 3. ขอบคุณ / THANKS (ขอบคุณ, ขอบใจ, แต๊งกิ้ว, ซาบซึ้ง, ไหว้) =================
  {
    id: 'line_10860',
    name: 'แซลลี่ ขอบคุณค่ะ',
    category: 'thanks',
    categoryName: 'ขอบคุณ',
    packageId: 789,
    stickerId: 10860,
    keywords: ['ขอบคุณ', 'ขอบใจ', 'แต๊งกิ้ว', 'ขอบคุณครับ', 'ขอบคุณค่ะ', 'thanks', 'thank you'],
    render: (size = 120) => renderLineSticker(10860, 'แซลลี่ ขอบคุณค่ะ', size),
  },
  {
    id: 'line_10864',
    name: 'แซลลี่ ซาบซึ้งน้ำตาไหล',
    category: 'thanks',
    categoryName: 'ขอบคุณ',
    packageId: 789,
    stickerId: 10864,
    keywords: ['ขอบคุณ', 'ซาบซึ้ง', 'ขอบพระคุณ', 'ตื้นตัน', 'thanks', 'grateful'],
    render: (size = 120) => renderLineSticker(10864, 'แซลลี่ ซาบซึ้งน้ำตาไหล', size),
  },
  {
    id: 'line_1993',
    name: 'มูน โค้งคำนับขอบคุณ',
    category: 'thanks',
    categoryName: 'ขอบคุณ',
    packageId: 446,
    stickerId: 1993,
    keywords: ['ขอบคุณ', 'ไหว้', 'ขอบใจ', 'คำนับ', 'thanks', 'thank'],
    render: (size = 120) => renderLineSticker(1993, 'มูน โค้งคำนับขอบคุณ', size),
  },
  {
    id: 'line_17844',
    name: 'มูน ขอบคุณอย่างสุดซึ้ง',
    category: 'thanks',
    categoryName: 'ขอบคุณ',
    packageId: 1070,
    stickerId: 17844,
    keywords: ['ขอบคุณ', 'ซาบซึ้ง', 'ขอบคุณมาก', 'thanks', 'grateful'],
    render: (size = 120) => renderLineSticker(17844, 'มูน ขอบคุณอย่างสุดซึ้ง', size),
  },
  {
    id: 'line_10551376',
    name: 'กราบขอบพระคุณจากใจ',
    category: 'thanks',
    categoryName: 'ขอบคุณ',
    packageId: 6136,
    stickerId: 10551376,
    keywords: ['ขอบคุณ', 'กราบ', 'ขอบพระคุณ', 'ไหว้', 'thanks', 'thank you'],
    render: (size = 120) => renderLineSticker(10551376, 'กราบขอบพระคุณจากใจ', size),
  },
  {
    id: 'line_16581242',
    name: 'ขอบคุณมากๆ เลยนะคะ',
    category: 'thanks',
    categoryName: 'ขอบคุณ',
    packageId: 8515,
    stickerId: 16581242,
    keywords: ['ขอบคุณ', 'ขอบใจ', 'แต๊งกิ้ว', 'thanks', 'thank you'],
    render: (size = 120) => renderLineSticker(16581242, 'ขอบคุณมากๆ เลยนะคะ', size),
  },

  // ================= 4. ดีใจ & หัวเราะ / HAPPY & LAUGH (ดีใจ, เย้, ยินดี, ฮ่าๆ, 555, ขำ, ตลก) =================
  {
    id: 'line_10855',
    name: 'แซลลี่ ยิ้มแฉ่งมีความสุข',
    category: 'happy',
    categoryName: 'ดีใจ / ขำ',
    packageId: 789,
    stickerId: 10855,
    keywords: ['ดีใจ', 'ยิ้ม', 'มีความสุข', 'ร่าเริง', 'happy', 'smile', 'joy'],
    render: (size = 120) => renderLineSticker(10855, 'แซลลี่ ยิ้มแฉ่งมีความสุข', size),
  },
  {
    id: 'line_10863',
    name: 'แซลลี่ หัวเราะก๊าก 555',
    category: 'happy',
    categoryName: 'ดีใจ / ขำ',
    packageId: 789,
    stickerId: 10863,
    keywords: ['ขำ', '555', 'ฮ่าๆ', 'ตลก', 'หัวเราะ', 'lol', 'laugh', 'funny', 'haha'],
    render: (size = 120) => renderLineSticker(10863, 'แซลลี่ หัวเราะก๊าก 555', size),
  },
  {
    id: 'line_1988',
    name: 'มูน ชูมือเย้!',
    category: 'happy',
    categoryName: 'ดีใจ / ขำ',
    packageId: 446,
    stickerId: 1988,
    keywords: ['ดีใจ', 'เย้', 'สำเร็จ', 'ไชโย', 'yay', 'happy', 'hurray'],
    render: (size = 120) => renderLineSticker(1988, 'มูน ชูมือเย้!', size),
  },
  {
    id: 'line_17839',
    name: 'มูน กระโดดยินดี',
    category: 'happy',
    categoryName: 'ดีใจ / ขำ',
    packageId: 1070,
    stickerId: 17839,
    keywords: ['ดีใจ', 'ยินดี', 'เย้', 'happy', 'smile', 'joy'],
    render: (size = 120) => renderLineSticker(17839, 'มูน กระโดดยินดี', size),
  },
  {
    id: 'line_10979906',
    name: 'บราวน์ & โคนี่ ไฮไฟว์',
    category: 'happy',
    categoryName: 'ดีใจ / ขำ',
    packageId: 6325,
    stickerId: 10979906,
    keywords: ['ดีใจ', 'เย้', 'สำเร็จ', '555', 'ยินดี', 'highfive', 'happy'],
    render: (size = 120) => renderLineSticker(10979906, 'บราวน์ & โคนี่ ไฮไฟว์', size),
  },
  {
    id: 'line_52002736',
    name: 'ปาร์ตี้เฉลิมฉลอง',
    category: 'happy',
    categoryName: 'ดีใจ / ขำ',
    packageId: 11537,
    stickerId: 52002736,
    keywords: ['ดีใจ', 'เย้', 'ฉลอง', 'ปาร์ตี้', '555', 'happy', 'party', 'yay'],
    render: (size = 120) => renderLineSticker(52002736, 'ปาร์ตี้เฉลิมฉลอง', size),
  },

  // ================= 5. ร้องไห้ & เศร้า / CRY & SAD (ร้องไห้, เศร้า, เสียใจ, ฮือ, แง, น้ำตา) =================
  {
    id: 'line_10857',
    name: 'แซลลี่ ร้องไห้กระซิก',
    category: 'cry',
    categoryName: 'ร้องไห้ / เศร้า',
    packageId: 789,
    stickerId: 10857,
    keywords: ['ร้องไห้', 'เศร้า', 'เสียใจ', 'ฮือ', 'แง', 'cry', 'sad', 'tear'],
    render: (size = 120) => renderLineSticker(10857, 'แซลลี่ ร้องไห้กระซิก', size),
  },
  {
    id: 'line_10865',
    name: 'แซลลี่ น้ำตาท่วมตัว',
    category: 'cry',
    categoryName: 'ร้องไห้ / เศร้า',
    packageId: 789,
    stickerId: 10865,
    keywords: ['ร้องไห้', 'น้ำตาไหล', 'แงๆ', 'ฮือๆ', 'cry', 'tear', 'sad'],
    render: (size = 120) => renderLineSticker(10865, 'แซลลี่ น้ำตาท่วมตัว', size),
  },
  {
    id: 'line_1990',
    name: 'มูน ร้องไห้น้ำตากระเด็น',
    category: 'cry',
    categoryName: 'ร้องไห้ / เศร้า',
    packageId: 446,
    stickerId: 1990,
    keywords: ['ร้องไห้', 'เสียใจ', 'เศร้า', 'ฮือ', 'cry', 'sad'],
    render: (size = 120) => renderLineSticker(1990, 'มูน ร้องไห้น้ำตากระเด็น', size),
  },
  {
    id: 'line_17841',
    name: 'มูน ปาดน้ำตาเหงาๆ',
    category: 'cry',
    categoryName: 'ร้องไห้ / เศร้า',
    packageId: 1070,
    stickerId: 17841,
    keywords: ['ร้องไห้', 'เศร้า', 'เสียใจ', 'เหงา', 'cry', 'sad', 'lonely'],
    render: (size = 120) => renderLineSticker(17841, 'มูน ปาดน้ำตาเหงาๆ', size),
  },
  {
    id: 'line_10979908',
    name: 'บราวน์ & โคนี่ ซับน้ำตาให้กัน',
    category: 'cry',
    categoryName: 'ร้องไห้ / เศร้า',
    packageId: 6325,
    stickerId: 10979908,
    keywords: ['ร้องไห้', 'เศร้า', 'เสียใจ', 'ปลอบใจ', 'cry', 'sad'],
    render: (size = 120) => renderLineSticker(10979908, 'บราวน์ & โคนี่ ซับน้ำตาให้กัน', size),
  },

  // ================= 6. ขอโทษ / SORRY (ขอโทษ, ขออภัย, ยกโทษ, สำนึกผิด) =================
  {
    id: 'line_11825374',
    name: 'กราบขออภัยอย่างสูง',
    category: 'sorry',
    categoryName: 'ขอโทษ',
    packageId: 6632,
    stickerId: 11825374,
    keywords: ['ขอโทษ', 'ขออภัย', 'ยกโทษ', 'สำนึกผิด', 'sorry', 'apologize', 'forgive'],
    render: (size = 120) => renderLineSticker(11825374, 'กราบขออภัยอย่างสูง', size),
  },
  {
    id: 'line_11825375',
    name: 'ขอโทษจริงๆ นะครับ',
    category: 'sorry',
    categoryName: 'ขอโทษ',
    packageId: 6632,
    stickerId: 11825375,
    keywords: ['ขอโทษ', 'ขอโทษนะ', 'ขอโทษครับ', 'ขอโทษค่ะ', 'sorry'],
    render: (size = 120) => renderLineSticker(11825375, 'ขอโทษจริงๆ นะครับ', size),
  },
  {
    id: 'line_11825377',
    name: 'ยกโทษให้หน่อยนะ',
    category: 'sorry',
    categoryName: 'ขอโทษ',
    packageId: 6632,
    stickerId: 11825377,
    keywords: ['ขอโทษ', 'ยกโทษ', 'ง้อ', 'ดีกันนะ', 'sorry', 'forgive'],
    render: (size = 120) => renderLineSticker(11825377, 'ยกโทษให้หน่อยนะ', size),
  },

  // ================= 7. ตกลง & โอเค / OK (โอเค, ตกลง, จัดไป, เยี่ยม, ok) =================
  {
    id: 'line_10861',
    name: 'แซลลี่ ชูสองนิ้ว โอเค',
    category: 'ok',
    categoryName: 'โอเค / ตกลง',
    packageId: 789,
    stickerId: 10861,
    keywords: ['โอเค', 'ตกลง', 'ได้เลย', 'ได้ครับ', 'ok', 'okay', 'yes', 'agree'],
    render: (size = 120) => renderLineSticker(10861, 'แซลลี่ ชูสองนิ้ว โอเค', size),
  },
  {
    id: 'line_10869',
    name: 'แซลลี่ ยกนิ้วโป้ง เยี่ยม',
    category: 'ok',
    categoryName: 'โอเค / ตกลง',
    packageId: 789,
    stickerId: 10869,
    keywords: ['เยี่ยม', 'ยอดเยี่ยม', 'ดีมาก', 'สุดยอด', 'good', 'great', 'ok'],
    render: (size = 120) => renderLineSticker(10869, 'แซลลี่ ยกนิ้วโป้ง เยี่ยม', size),
  },
  {
    id: 'line_1994',
    name: 'มูน ตกลงตามนั้น',
    category: 'ok',
    categoryName: 'โอเค / ตกลง',
    packageId: 446,
    stickerId: 1994,
    keywords: ['ตกลง', 'โอเค', 'จัดไป', 'ตามนั้น', 'ok', 'yes'],
    render: (size = 120) => renderLineSticker(1994, 'มูน ตกลงตามนั้น', size),
  },
  {
    id: 'line_16581244',
    name: 'รับทราบ จัดการให้เลย',
    category: 'ok',
    categoryName: 'โอเค / ตกลง',
    packageId: 8515,
    stickerId: 16581244,
    keywords: ['รับทราบ', 'ตกลง', 'โอเค', 'จัดไป', 'ok', 'roger'],
    render: (size = 120) => renderLineSticker(16581244, 'รับทราบ จัดการให้เลย', size),
  },

  // ================= 8. ตกใจ / SHOCK (ตกใจ, ช็อก, ห๊ะ, อะไรนะ, เหวอ) =================
  {
    id: 'line_10866',
    name: 'แซลลี่ ตาโตตกใจ',
    category: 'shock',
    categoryName: 'ตกใจ',
    packageId: 789,
    stickerId: 10866,
    keywords: ['ตกใจ', 'ช็อก', 'ห๊ะ', 'อะไรนะ', 'shock', 'surprised', 'omg'],
    render: (size = 120) => renderLineSticker(10866, 'แซลลี่ ตาโตตกใจ', size),
  },
  {
    id: 'line_10878',
    name: 'แซลลี่ เหวออ้าปากค้าง',
    category: 'shock',
    categoryName: 'ตกใจ',
    packageId: 789,
    stickerId: 10878,
    keywords: ['ตกใจ', 'อึ้ง', 'เหวอ', 'พูดไม่ออก', 'shock', 'what'],
    render: (size = 120) => renderLineSticker(10878, 'แซลลี่ เหวออ้าปากค้าง', size),
  },
  {
    id: 'line_1995',
    name: 'มูน ช็อกหน้าถอดสี',
    category: 'shock',
    categoryName: 'ตกใจ',
    packageId: 446,
    stickerId: 1995,
    keywords: ['ตกใจ', 'ช็อก', 'เหวอ', 'จริงเหรอ', 'shock', 'omg'],
    render: (size = 120) => renderLineSticker(1995, 'มูน ช็อกหน้าถอดสี', size),
  },

  // ================= 9. นอน & เหนื่อย / SLEEP & TIRED =================
  {
    id: 'line_10870',
    name: 'แซลลี่ นอนหลับฝันดี',
    category: 'sleep',
    categoryName: 'นอน / เหนื่อย',
    packageId: 789,
    stickerId: 10870,
    keywords: ['นอน', 'หลับ', 'ฝันดี', 'ง่วง', 'ราตรีสวัสดิ์', 'sleep', 'goodnight', 'sleepy'],
    render: (size = 120) => renderLineSticker(10870, 'แซลลี่ นอนหลับฝันดี', size),
  },
  {
    id: 'line_10880',
    name: 'แซลลี่ ง่วงนอนหาว',
    category: 'sleep',
    categoryName: 'นอน / เหนื่อย',
    packageId: 789,
    stickerId: 10880,
    keywords: ['ง่วง', 'นอน', 'หาว', 'ไม่ไหว', 'sleepy', 'tired'],
    render: (size = 120) => renderLineSticker(10880, 'แซลลี่ ง่วงนอนหาว', size),
  },
  {
    id: 'line_10867',
    name: 'แซลลี่ หมดแรงเพลีย',
    category: 'sleep',
    categoryName: 'นอน / เหนื่อย',
    packageId: 789,
    stickerId: 10867,
    keywords: ['เหนื่อย', 'หมดแรง', 'เพลีย', 'ไม่ไหว', 'tired', 'exhausted'],
    render: (size = 120) => renderLineSticker(10867, 'แซลลี่ หมดแรงเพลีย', size),
  },
  {
    id: 'line_1998',
    name: 'มูน นอนน้ำลายยืด',
    category: 'sleep',
    categoryName: 'นอน / เหนื่อย',
    packageId: 446,
    stickerId: 1998,
    keywords: ['นอน', 'หลับ', 'ฝันดี', 'ง่วง', 'sleep'],
    render: (size = 120) => renderLineSticker(1998, 'มูน นอนน้ำลายยืด', size),
  },

  // ================= 10. กินข้าว & หิว / FOOD =================
  {
    id: 'line_10871',
    name: 'แซลลี่ หม่ำของอร่อย',
    category: 'food',
    categoryName: 'กิน / หิว',
    packageId: 789,
    stickerId: 10871,
    keywords: ['กิน', 'หิว', 'ข้าว', 'กินข้าว', 'อร่อย', 'eat', 'hungry', 'food', 'yummy'],
    render: (size = 120) => renderLineSticker(10871, 'แซลลี่ หม่ำของอร่อย', size),
  },
  {
    id: 'line_10884',
    name: 'แซลลี่ ช้อนส้อมพร้อมกิน',
    category: 'food',
    categoryName: 'กิน / หิว',
    packageId: 789,
    stickerId: 10884,
    keywords: ['หิว', 'กิน', 'กินข้าว', 'ชวนกิน', 'hungry', 'eat', 'food'],
    render: (size = 120) => renderLineSticker(10884, 'แซลลี่ ช้อนส้อมพร้อมกิน', size),
  },
  {
    id: 'line_1999',
    name: 'มูน อิ่มหมีพีมัน',
    category: 'food',
    categoryName: 'กิน / หิว',
    packageId: 446,
    stickerId: 1999,
    keywords: ['กิน', 'อิ่ม', 'ข้าว', 'อร่อย', 'eat', 'full', 'food'],
    render: (size = 120) => renderLineSticker(1999, 'มูน อิ่มหมีพีมัน', size),
  },

  // ================= 11. สู้ๆ / FIGHTING =================
  {
    id: 'line_10872',
    name: 'แซลลี่ ชูกำปั้นสู้ๆ',
    category: 'fighting',
    categoryName: 'สู้ๆ',
    packageId: 789,
    stickerId: 10872,
    keywords: ['สู้ๆ', 'สู้ตาย', 'กำลังใจ', 'ไฟท์โตะ', 'ลุย', 'fight', 'fighting', 'cheer'],
    render: (size = 120) => renderLineSticker(10872, 'แซลลี่ ชูกำปั้นสู้ๆ', size),
  },
  {
    id: 'line_2000',
    name: 'มูน ฟิตเต็มร้อย ลุย!',
    category: 'fighting',
    categoryName: 'สู้ๆ',
    packageId: 446,
    stickerId: 2000,
    keywords: ['สู้ๆ', 'ลุย', 'ฟิต', 'สู้ตาย', 'fighting', 'power'],
    render: (size = 120) => renderLineSticker(2000, 'มูน ฟิตเต็มร้อย ลุย!', size),
  },
  {
    id: 'line_16581246',
    name: 'เป็นกำลังใจให้นะคะ สู้ๆ',
    category: 'fighting',
    categoryName: 'สู้ๆ',
    packageId: 8515,
    stickerId: 16581246,
    keywords: ['สู้ๆ', 'กำลังใจ', 'สู้', 'support', 'fighting', 'cheer'],
    render: (size = 120) => renderLineSticker(16581246, 'เป็นกำลังใจให้นะคะ สู้ๆ', size),
  },

  // ================= 12. บ๊ายบาย / BYE =================
  {
    id: 'line_10876',
    name: 'แซลลี่ โบกมือบ๊ายบาย',
    category: 'bye',
    categoryName: 'บ๊ายบาย',
    packageId: 789,
    stickerId: 10876,
    keywords: ['บาย', 'บ๊ายบาย', 'ลาก่อน', 'เจอกัน', 'bye', 'goodbye', 'see you'],
    render: (size = 120) => renderLineSticker(10876, 'แซลลี่ โบกมือบ๊ายบาย', size),
  },
  {
    id: 'line_2001',
    name: 'มูน บ๊ายบายจ้า',
    category: 'bye',
    categoryName: 'บ๊ายบาย',
    packageId: 446,
    stickerId: 2001,
    keywords: ['บาย', 'บ๊ายบาย', 'ลาก่อน', 'bye', 'goodbye'],
    render: (size = 120) => renderLineSticker(2001, 'มูน บ๊ายบายจ้า', size),
  },
];

// Vector SVG Stickers (Instant fallback)
export const VECTOR_STICKERS: StickerItem[] = [
  {
    id: 'brown_love',
    name: 'บราวน์ ส่งหัวใจ',
    category: 'love',
    categoryName: 'รัก / หวาน',
    keywords: ['รัก', 'หัวใจ', 'บราวน์', 'ชอบ', 'love', 'heart'],
    render: (size = 120) => (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="65" r="42" fill="#8B5A2B" />
        <circle cx="30" cy="30" r="14" fill="#8B5A2B" />
        <circle cx="30" cy="30" r="8" fill="#5C3A1E" />
        <circle cx="90" cy="30" r="14" fill="#8B5A2B" />
        <circle cx="90" cy="30" r="8" fill="#5C3A1E" />
        <ellipse cx="60" cy="72" rx="18" ry="14" fill="#F5DEB3" />
        <ellipse cx="60" cy="66" rx="6" ry="4" fill="#3D2314" />
        <path d="M60 70V76M54 75Q60 79 66 75" stroke="#3D2314" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="45" cy="58" r="4" fill="#221105" />
        <circle cx="75" cy="58" r="4" fill="#221105" />
        <ellipse cx="38" cy="68" rx="6" ry="4" fill="#FF8888" opacity="0.6" />
        <ellipse cx="82" cy="68" rx="6" ry="4" fill="#FF8888" opacity="0.6" />
        <path d="M85 80 C85 70, 100 70, 100 82 C100 95, 85 105, 85 110 C85 105, 70 95, 70 82 C70 70, 85 70, 85 80 Z" fill="#FF3366" />
      </svg>
    ),
  },
  {
    id: 'cony_happy',
    name: 'โคนี่ ร่าเริง',
    category: 'happy',
    categoryName: 'ดีใจ / ขำ',
    keywords: ['ดีใจ', 'ยิ้ม', 'โคนี่', 'เย้', 'happy', 'yay'],
    render: (size = 120) => (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="44" cy="28" rx="10" ry="26" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
        <ellipse cx="44" cy="28" rx="5" ry="18" fill="#FFB6C1" />
        <ellipse cx="76" cy="28" rx="10" ry="26" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
        <ellipse cx="76" cy="28" rx="5" ry="18" fill="#FFB6C1" />
        <circle cx="60" cy="70" r="40" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
        <path d="M42 62Q48 54 54 62" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M66 62Q72 54 78 62" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <ellipse cx="60" cy="68" rx="3.5" ry="2.5" fill="#FF69B4" />
        <path d="M53 74Q60 84 67 74" fill="#FF3366" stroke="#1F2937" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'brown_angry',
    name: 'บราวน์ โมโหไฟลุก',
    category: 'anger',
    categoryName: 'โกรธ / โมโห',
    keywords: ['โกรธ', 'โมโห', 'เดือด', 'ไฟลุก', 'angry', 'mad', 'fire'],
    render: (size = 120) => (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Fire behind */}
        <path d="M40 25 Q60 5 80 25 Q95 45 80 65 Q60 50 40 65 Z" fill="#EF4444" opacity="0.8" />
        <circle cx="60" cy="65" r="42" fill="#8B5A2B" />
        <circle cx="30" cy="30" r="14" fill="#8B5A2B" />
        <circle cx="90" cy="30" r="14" fill="#8B5A2B" />
        {/* Angry angled eyebrows */}
        <path d="M38 48 L52 56" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
        <path d="M82 48 L68 56" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
        <circle cx="45" cy="60" r="4" fill="#221105" />
        <circle cx="75" cy="60" r="4" fill="#221105" />
        <ellipse cx="60" cy="74" rx="18" ry="14" fill="#F5DEB3" />
        <path d="M53 78 Q60 70 67 78" stroke="#3D2314" strokeWidth="3" fill="none" />
      </svg>
    ),
  },
];

// ================= FLATICON MESSAGE STICKERS =================
// Message & Chat themed stickers from https://www.flaticon.com/free-stickers/message
export const FLATICON_MESSAGE_STICKERS: StickerItem[] = [
  {
    id: 'fl_8819078',
    name: 'Boom! ระเบิดอารมณ์',
    category: 'anger',
    categoryName: 'โกรธ / ระเบิด',
    keywords: ['โกรธ', 'โมโห', 'เดือด', 'ระเบิด', 'บึ้ม', 'พัง', 'ตูม', 'เกรี้ยวกราด', 'ไฟลุก', 'boom', 'angry', 'mad', 'rage', 'explosion'],
    render: (size = 120) => renderFlaticonSticker('8819078', 'Boom! ระเบิดอารมณ์', size),
  },
  {
    id: 'fl_8819082',
    name: 'Oops! อุ๊ย พลาดแล้ว',
    category: 'sorry',
    categoryName: 'ขอโทษ / อุ๊ย',
    keywords: ['อุ๊ย', 'พลาด', 'ขอโทษ', 'ตกใจ', 'ซุ่มซ่าม', 'ผิดไปแล้ว', 'แหะๆ', 'oops', 'sorry', 'mistake', 'whoops'],
    render: (size = 120) => renderFlaticonSticker('8819082', 'Oops! อุ๊ย พลาดแล้ว', size),
  },
  {
    id: 'fl_8819074',
    name: 'Wow! ว้าว สุดยอด',
    category: 'happy',
    categoryName: 'ดีใจ / ว้าว',
    keywords: ['ว้าว', 'สุดยอด', 'ยอดเยี่ยม', 'เจ๋ง', 'ทึ่ง', 'สุดปัง', 'wow', 'amazing', 'great', 'awesome'],
    render: (size = 120) => renderFlaticonSticker('8819074', 'Wow! ว้าว สุดยอด', size),
  },
  {
    id: 'fl_8819076',
    name: 'OMG! ตกใจมาก',
    category: 'shock',
    categoryName: 'ตกใจ / อึ้ง',
    keywords: ['omg', 'ตกใจ', 'คุณพระ', 'พระเจ้า', 'ช็อค', 'อึ้ง', 'ตาค้าง', 'ไม่จริง', 'shock', 'surprised', 'unbelievable'],
    render: (size = 120) => renderFlaticonSticker('8819076', 'OMG! ตกใจมาก', size),
  },
  {
    id: 'fl_8819080',
    name: 'Yes! ตกลง/สำเร็จ',
    category: 'ok',
    categoryName: 'โอเค / ตกลง',
    keywords: ['yes', 'ใช่', 'ตกลง', 'สำเร็จ', 'โอเค', 'เอาเลย', 'ถูกต้อง', 'เยี่ยม', 'เยส', 'agree', 'done', 'success'],
    render: (size = 120) => renderFlaticonSticker('8819080', 'Yes! ตกลง/สำเร็จ', size),
  },
  {
    id: 'fl_8819084',
    name: 'No! ไม่เอา/ปฏิเสธ',
    category: 'anger',
    categoryName: 'ปฏิเสธ / ไม่',
    keywords: ['no', 'ไม่', 'อย่า', 'ไม่เอา', 'ปฏิเสธ', 'ห้าม', 'ไม่ยอม', 'stop', 'refuse', 'never', 'ไม่อะ'],
    render: (size = 120) => renderFlaticonSticker('8819084', 'No! ไม่เอา/ปฏิเสธ', size),
  },
  {
    id: 'fl_8819086',
    name: 'Cool! เจ๋งเป้ง/เท่',
    category: 'happy',
    categoryName: 'ดีใจ / เจ๋ง',
    keywords: ['cool', 'เจ๋ง', 'เท่', 'สุดยอด', 'คูล', 'เก่งมาก', 'เลิศ', 'awesome', 'nice'],
    render: (size = 120) => renderFlaticonSticker('8819086', 'Cool! เจ๋งเป้ง/เท่', size),
  },
  {
    id: 'fl_8819087',
    name: 'Love You! รักนะ',
    category: 'love',
    categoryName: 'รัก / หวาน',
    keywords: ['love', 'รัก', 'รักนะ', 'เลิฟยู', 'ชอบ', 'หัวใจ', 'แฟน', 'รักเธอ', 'love you', 'heart', 'kiss'],
    render: (size = 120) => renderFlaticonSticker('8819087', 'Love You! รักนะ', size),
  },
  {
    id: 'fl_8819089',
    name: 'Haha! ฮ่าๆ 555',
    category: 'happy',
    categoryName: 'ดีใจ / ขำขัน',
    keywords: ['555', '5555', 'ฮ่าๆ', 'ขำ', 'ตลก', 'หัวเราะ', 'กวน', 'ฮา', 'haha', 'lol', 'funny', 'laugh'],
    render: (size = 120) => renderFlaticonSticker('8819089', 'Haha! ฮ่าๆ 555', size),
  },
  {
    id: 'fl_8819091',
    name: 'Super! ซูเปอร์ยอดเยี่ยม',
    category: 'ok',
    categoryName: 'โอเค / ยอดเยี่ยม',
    keywords: ['super', 'สุดยอด', 'ซูเปอร์', 'ยอดเยี่ยม', 'สุดปัง', 'ดีเลิศ', 'เยี่ยมยอด', 'great', 'excellent'],
    render: (size = 120) => renderFlaticonSticker('8819091', 'Super! ซูเปอร์ยอดเยี่ยม', size),
  },
  {
    id: 'fl_8819093',
    name: 'Thanks! ขอบคุณมาก',
    category: 'thanks',
    categoryName: 'ขอบคุณ',
    keywords: ['ขอบคุณ', 'ขอบใจ', 'แต๊งกิ้ว', 'แต้งกิ้ว', 'ขอบคุณมาก', 'thank', 'thanks', 'thx', 'grateful'],
    render: (size = 120) => renderFlaticonSticker('8819093', 'Thanks! ขอบคุณมาก', size),
  },
  {
    id: 'fl_6028690',
    name: 'Hi! สวัสดี/หวัดดี',
    category: 'happy',
    categoryName: 'ทักทาย / สวัสดี',
    keywords: ['hi', 'hello', 'สวัสดี', 'หวัดดี', 'ดีจ้า', 'ทักทาย', 'ฮาย', 'ดีคับ', 'ดีค่ะ', 'hey'],
    render: (size = 120) => renderFlaticonSticker('6028690', 'Hi! สวัสดี/หวัดดี', size),
  },
  {
    id: 'fl_5175316',
    name: 'Speech Bubble แชทคุย',
    category: 'flaticon',
    categoryName: 'Flaticon ข้อความ',
    keywords: ['ข้อความ', 'แชท', 'คุย', 'ส่งข้อความ', 'ทัก', 'สนทนา', 'message', 'chat', 'bubble'],
    render: (size = 120) => renderFlaticonSticker('5175316', 'Speech Bubble แชทคุย', size),
  },
  {
    id: 'fl_7648244',
    name: 'Chat Messenger กล่องแชท',
    category: 'flaticon',
    categoryName: 'Flaticon ข้อความ',
    keywords: ['แชท', 'ข้อความ', 'คุยกัน', 'สนทนา', 'ตอบแชท', 'messenger', 'chat', 'talk'],
    render: (size = 120) => renderFlaticonSticker('7648244', 'Chat Messenger กล่องแชท', size),
  },
  {
    id: 'fl_9553172',
    name: 'Double Chat คุยแลกเปลี่ยน',
    category: 'flaticon',
    categoryName: 'Flaticon ข้อความ',
    keywords: ['คุยกัน', 'สนทนา', 'เม้าท์', 'แลกเปลี่ยน', 'ปรึกษา', 'พูดคุย', 'discussion', 'chat', 'talk'],
    render: (size = 120) => renderFlaticonSticker('9553172', 'Double Chat คุยแลกเปลี่ยน', size),
  },
  {
    id: 'fl_9589371',
    name: 'Love Message ส่งรัก',
    category: 'love',
    categoryName: 'รัก / ข้อความหวาน',
    keywords: ['รัก', 'ข้อความรัก', 'บอกรัก', 'คิดถึง', 'เลิฟ', 'ส่งรัก', 'love message', 'heart', 'sweet'],
    render: (size = 120) => renderFlaticonSticker('9589371', 'Love Message ส่งรัก', size),
  },
  {
    id: 'fl_6740196',
    name: 'Love Forever รักตลอดไป',
    category: 'love',
    categoryName: 'รัก / หวาน',
    keywords: ['รัก', 'รักตลอดไป', 'หัวใจ', 'เลิฟ', 'แฟน', 'คิดถึงมาก', 'love forever', 'heart'],
    render: (size = 120) => renderFlaticonSticker('6740196', 'Love Forever รักตลอดไป', size),
  },
  {
    id: 'fl_4289407',
    name: 'Love Letter จดหมายรัก',
    category: 'love',
    categoryName: 'รัก / จดหมายรัก',
    keywords: ['รัก', 'จดหมายรัก', 'สารภาพรัก', 'ส่งจดหมาย', 'หัวใจ', 'love letter', 'confession'],
    render: (size = 120) => renderFlaticonSticker('4289407', 'Love Letter จดหมายรัก', size),
  },
  {
    id: 'fl_7647464',
    name: 'Love Me ขอความรักหน่อย',
    category: 'love',
    categoryName: 'รัก / อ้อนวอน',
    keywords: ['รัก', 'รักฉัน', 'ขอความรัก', 'อ้อน', 'กอด', 'ง้อ', 'love me', 'please'],
    render: (size = 120) => renderFlaticonSticker('7647464', 'Love Me ขอความรักหน่อย', size),
  },
  {
    id: 'fl_7647450',
    name: 'Sweet Chat แชทหวานแหวว',
    category: 'love',
    categoryName: 'รัก / แชทหวาน',
    keywords: ['หวาน', 'น่ารัก', 'แชทหวาน', 'กุ๊กกิ๊ก', 'รัก', 'sweet chat', 'cute', 'romance'],
    render: (size = 120) => renderFlaticonSticker('7647450', 'Sweet Chat แชทหวานแหวว', size),
  },
  {
    id: 'fl_7647454',
    name: 'Happy Chat แชทสดใส',
    category: 'happy',
    categoryName: 'ดีใจ / แชทสดใส',
    keywords: ['แชทสดใส', 'คุยสนุก', 'ยิ้ม', 'มีความสุข', 'ดีใจ', 'happy chat', 'smile', 'joy'],
    render: (size = 120) => renderFlaticonSticker('7647454', 'Happy Chat แชทสดใส', size),
  },
];

// Unified catalog
export const ALL_STICKERS: StickerItem[] = [
  ...OFFICIAL_LINE_STICKERS,
  ...FLATICON_MESSAGE_STICKERS,
  ...VECTOR_STICKERS,
];

// Helper to get sticker by ID
export const getStickerById = (id: string): StickerItem | undefined => {
  // Check exact ID match
  const found = ALL_STICKERS.find((s) => s.id === id);
  if (found) return found;

  // Check Flaticon ID e.g. "fl_8819078"
  if (id.startsWith('fl_')) {
    const flId = id.replace('fl_', '');
    const flItem = FLATICON_MESSAGE_STICKERS.find((s) => s.id === id);
    if (flItem) return flItem;

    return {
      id,
      name: `Flaticon #${flId}`,
      category: 'flaticon',
      categoryName: 'Flaticon ข้อความ',
      keywords: [],
      render: (size = 120) => renderFlaticonSticker(flId, `Flaticon #${flId}`, size),
    };
  }

  // Check numeric sticker ID e.g. "10858"
  const numericId = parseInt(id.replace('line_', ''), 10);
  if (!isNaN(numericId)) {
    const byNum = OFFICIAL_LINE_STICKERS.find((s) => s.stickerId === numericId);
    if (byNum) return byNum;

    // Dynamically create entry for any valid LINE stickerId
    return {
      id: `line_${numericId}`,
      name: `สติกเกอร์ LINE #${numericId}`,
      category: 'happy',
      categoryName: 'LINE Sticker',
      stickerId: numericId,
      keywords: [],
      render: (size = 120) => renderLineSticker(numericId, `LINE #${numericId}`, size),
    };
  }

  return undefined;
};

// ================= STICKER PREDICTION / KEYWORD GUESSING =================
// Predicts stickers based on typed message (e.g. "โกรธ" -> suggests anger stickers)
export const predictStickers = (text: string): StickerItem[] => {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  const matched: StickerItem[] = [];

  // Match keywords in all stickers
  for (const sticker of ALL_STICKERS) {
    const hasMatch = sticker.keywords.some((kw) => {
      const lowerKw = kw.toLowerCase();
      return trimmed.includes(lowerKw) || lowerKw.includes(trimmed);
    });

    if (hasMatch && !matched.some((m) => m.id === sticker.id)) {
      matched.push(sticker);
    }
  }

  // Return up to 8 top matching stickers
  return matched.slice(0, 8);
};

// ================= STICKER PICKER MODAL =================
interface StickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (stickerId: string) => void;
  className?: string;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
  className = 'fixed sm:absolute bottom-0 sm:bottom-20 left-0 right-0 sm:right-auto sm:left-4 z-50 w-full sm:w-88 max-h-[75vh] sm:max-h-[500px] rounded-t-3xl sm:rounded-2xl pb-[env(safe-area-inset-bottom)]',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredStickers = ALL_STICKERS.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      item.category === activeCategory ||
      (activeCategory === 'flaticon' && item.id.startsWith('fl_'));

    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { key: 'all', label: 'ทั้งหมด', icon: Sparkles },
    { key: 'flaticon', label: '💬 Flaticon ข้อความ', icon: MessageSquare },
    { key: 'anger', label: 'โกรธ', icon: Flame },
    { key: 'love', label: 'รัก', icon: Heart },
    { key: 'thanks', label: 'ขอบคุณ', icon: Award },
    { key: 'happy', label: 'ดีใจ/ขำ', icon: Smile },
    { key: 'cry', label: 'ร้องไห้', icon: Frown },
    { key: 'ok', label: 'โอเค', icon: ThumbsUp },
    { key: 'sleep', label: 'นอน/เพลีย', icon: Moon },
    { key: 'food', label: 'หิว/กิน', icon: Coffee },
  ];

  return (
    <div className={`${className} bg-white dark:bg-[#20242B] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in fade-in duration-150 select-none`}>
      {/* Header & Search */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-2 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-100">
            <Smile className="w-4 h-4 text-line-green" />
            <span>สติกเกอร์ LINE & Flaticon Message</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Emotion Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาอารมณ์ เช่น โกรธ, ว้าว, รัก, ขอบคุณ, 555, แชท..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-line-green"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1.5 overflow-x-auto border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#20242B] no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-line-green text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sticker Grid */}
      <div className="p-3 grid grid-cols-4 gap-2 max-h-64 overflow-y-auto bg-gray-50/50 dark:bg-[#1C2027]/50">
        {filteredStickers.length === 0 ? (
          <div className="col-span-4 py-8 text-center text-xs text-gray-400">
            ไม่พบสติกเกอร์ที่ตรงกับ "{searchQuery}"
          </div>
        ) : (
          filteredStickers.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectSticker(item.id);
                onClose();
              }}
              className="group flex flex-col items-center justify-center p-1.5 rounded-xl bg-white dark:bg-[#282E38] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-100 dark:border-gray-800 hover:border-line-green cursor-pointer transition-all hover:scale-105 shadow-sm"
              title={item.name}
            >
              <div className="w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-110">
                {item.render(56)}
              </div>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate max-w-full mt-0.5">
                {item.name}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-gray-100/70 dark:bg-gray-800/60 text-[10px] text-center text-gray-400 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span>LINE & Flaticon Stickers</span>
        <span>{filteredStickers.length} สติกเกอร์</span>
      </div>
    </div>
  );
};
