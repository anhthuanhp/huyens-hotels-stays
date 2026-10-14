# Đổi tên ảnh SEO — 15/10/2026

Đã cập nhật trực tiếp project Supabase huyen-hotels: 129 ảnh (115 media, 8 hero và 6 blog), 147 bản ghi (115 media + 8 hero + 6 blog + 4 khách sạn + 14 phòng).

Tên file dùng chữ thường không dấu, dấu gạch ngang, khách sạn/loại phòng hoặc chủ đề, số ảnh và mã ngắn để tránh trùng. Ví dụ: anh-kim-hotel-phong-family-with-city-view-anh-dai-dien-08-m190.webp.

## Ảnh cố định và code

Logo công khai dùng /images/huyens-hotels-stays-logo.webp. Có bản PNG cùng tên, giữ các tên cũ làm URL tương thích. Các tham chiếu metadata, header và ảnh fallback đã cập nhật. Icon Zalo/WhatsApp đã có tên phù hợp; các SVG mẫu Next/Vercel không dùng trên giao diện được giữ nguyên.

Các ảnh mẫu khách sạn/phòng vốn trỏ file local không tồn tại đã được thay bằng URL ảnh thật. Trường image của 4 khách sạn và 14 phòng trong Supabase trỏ đúng ảnh đại diện.

Admin upload phòng, khách sạn, hero, blog và trải nghiệm sử dụng chung app/lib/image-seo.ts. Không phụ thuộc tên camera người dùng tải lên. Alt để trống được bổ sung từ tên cơ sở/phòng; alt đã nhập được giữ nguyên. Đã bổ sung 114 alt tiếng Việt và 114 alt tiếng Anh trong media.

## Bảo toàn dữ liệu

Dùng Storage API copy tạo object tên mới rồi kiểm tra HTTP/MIME/kích thước trước khi cập nhật tham chiếu. Không sửa storage.objects bằng SQL. Không xóa object cũ để tránh làm hỏng URL đã được Google/cache lưu. Không thay nội dung ảnh, thứ tự gallery, is_cover, status, entity_type hay entity_id.

Backup trước thay đổi: image-rename-plan.json (snapshot + before/next từng bản ghi). Nhật ký: image-rename-progress.json. Xác minh: image-rename-result.json. Các file báo cáo chỉ chứa metadata/URL ảnh; không có API key.

Kiểm tra: 6 test tên ảnh và TypeScript thành công. Lint admin còn lỗi useEffect đã có từ trước; các đoạn upload/tên ảnh không phát sinh lỗi kiểu dữ liệu. Toàn bộ 129 URL mới và 129 URL cũ đã được kiểm tra. Code logo và quy tắc upload mới cần deploy; thay đổi Supabase đã áp dụng, trang cache ISR sẽ cập nhật khi làm mới.

Tài liệu: https://supabase.com/docs/guides/storage/management/copy-move-objects

## Danh sách

| Bucket | Tên cũ | Tên mới |
|---|---|---|
| website-media | rooms/huyen-house/cozy-room/1790241097474-0-ae-guesthouse-phong-double-toilet.jpg | rooms/huyen-house/cozy-room/huyen-house-phong-cozy-cho-1-nguoi-anh-01-m76.jpg |
| website-media | rooms/huyen-house/cozy-room/1790241098243-1-ae-guesthouse-phong-sigle-door.jpg | rooms/huyen-house/cozy-room/huyen-house-phong-cozy-cho-1-nguoi-anh-02-m77.jpg |
| website-media | rooms/huyen-house/cozy-room/1790241098592-2-ae-guesthouse-phong-sigle-room.jpg | rooms/huyen-house/cozy-room/huyen-house-phong-cozy-cho-1-nguoi-anh-dai-dien-03-m78.jpg |
| website-media | rooms/huyen-house/cozy-room/1790241098962-3-ae-guesthouse-phong-sigle-view.jpg | rooms/huyen-house/cozy-room/huyen-house-phong-cozy-cho-1-nguoi-anh-04-m79.jpg |
| website-media | rooms/huyen-house/family-house/1790242112551-0-ae-guesthouse-phong-double.jpg | rooms/huyen-house/family-house/huyen-house-phong-deluxe-double-anh-01-m81.jpg |
| website-media | rooms/huyen-house/family-house/1790242113194-1-ae-guesthouse-phong-double-bed.jpg | rooms/huyen-house/family-house/huyen-house-phong-deluxe-double-anh-02-m82.jpg |
| website-media | rooms/huyen-house/family-house/1790242113712-2-ae-guesthouse-phong-double-bedroom.jpg | rooms/huyen-house/family-house/huyen-house-phong-deluxe-double-anh-03-m83.jpg |
| website-media | rooms/huyen-house/family-house/1790242114205-3-ae-guesthouse-phong-double-door.jpg | rooms/huyen-house/family-house/huyen-house-phong-deluxe-double-anh-04-m84.jpg |
| website-media | rooms/huyen-house/family-house/1790242114706-4-ae-guesthouse-phong-double-tivi.jpg | rooms/huyen-house/family-house/huyen-house-phong-deluxe-double-anh-05-m85.jpg |
| website-media | rooms/huyen-house/family-house/1790242115159-5-ae-guesthouse-phong-double-view.jpg | rooms/huyen-house/family-house/huyen-house-phong-deluxe-double-anh-dai-dien-06-m86.jpg |
| website-media | rooms/huyen-house/family-house/1790242115706-6-ae-guesthouse-phong-double-window.jpg | rooms/huyen-house/family-house/huyen-house-phong-deluxe-double-anh-07-m87.jpg |
| website-media | rooms/huyenhomestay/family-homestay/1790243793911-0-_hkt5645_23_11zon.webp | rooms/huyenhomestay/family-homestay/huyenhomestay-phong-family-co-ban-cong-anh-dai-dien-01-m88.webp |
| website-media | rooms/huyenhomestay/family-homestay/1790243795271-1-_hkt5642_21_11zon.webp | rooms/huyenhomestay/family-homestay/huyenhomestay-phong-family-co-ban-cong-anh-02-m89.webp |
| website-media | rooms/huyenhomestay/family-homestay/1790243796060-2-_hkt5643_22_11zon.webp | rooms/huyenhomestay/family-homestay/huyenhomestay-phong-family-co-ban-cong-anh-03-m90.webp |
| website-media | rooms/huyenhomestay/family-homestay/1790243797830-4-_hkt5647_24_11zon.webp | rooms/huyenhomestay/family-homestay/huyenhomestay-phong-family-co-ban-cong-anh-04-m92.webp |
| website-media | rooms/huyenhomestay/family-homestay/1790243798568-5-_hkt5649_25_11zon.webp | rooms/huyenhomestay/family-homestay/huyenhomestay-phong-family-co-ban-cong-anh-05-m93.webp |
| website-media | hotels/huyenhomestay/1790243840412-0-_hkt5645_23_11zon.webp | hotels/huyenhomestay/huyenhomestay-khach-san-anh-dai-dien-01-m94.webp |
| website-media | hotels/huyen-house/1790244047764-0-375264157_13_11zon.webp | hotels/huyen-house/huyen-house-khach-san-anh-dai-dien-01-m96.webp |
| website-media | hotels/anh-kim-hotel/1790244078452-0-dsc_2718_63_11zon.webp | hotels/anh-kim-hotel/anh-kim-hotel-khach-san-anh-dai-dien-01-m97.webp |
| website-media | rooms/ae-guesthouse/standard-room/1790244258404-0-680163612_47_11zon.webp | rooms/ae-guesthouse/standard-room/ae-guesthouse-phong-studio-without-window-anh-dai-dien-01-m117.webp |
| website-media | rooms/ae-guesthouse/standard-room/1790244258824-1-680163614_48_11zon.webp | rooms/ae-guesthouse/standard-room/ae-guesthouse-phong-studio-without-window-anh-02-m118.webp |
| website-media | rooms/ae-guesthouse/standard-room/1790244259314-2-680163615_49_11zon.webp | rooms/ae-guesthouse/standard-room/ae-guesthouse-phong-studio-without-window-anh-03-m119.webp |
| website-media | rooms/ae-guesthouse/standard-room/1790244259951-3-680163617_51_11zon.webp | rooms/ae-guesthouse/standard-room/ae-guesthouse-phong-studio-without-window-anh-04-m120.webp |
| website-media | rooms/ae-guesthouse/standard-room/1790244260360-4-680163618_52_11zon.webp | rooms/ae-guesthouse/standard-room/ae-guesthouse-phong-studio-without-window-anh-05-m121.webp |
| website-media | rooms/ae-guesthouse/standard-room/1790244260779-5-680163621_53_11zon.webp | rooms/ae-guesthouse/standard-room/ae-guesthouse-phong-studio-without-window-anh-06-m122.webp |
| website-media | rooms/ae-guesthouse/standard-room/1790244261137-6-680163625_54_11zon.webp | rooms/ae-guesthouse/standard-room/ae-guesthouse-phong-studio-without-window-anh-07-m123.webp |
| website-media | rooms/anh-kim-hotel/standard-double/1790265397449-0-dsc_2747_79_11zon.webp | rooms/anh-kim-hotel/standard-double/anh-kim-hotel-phong-standard-double-anh-01-m131.webp |
| website-media | rooms/anh-kim-hotel/standard-double/1790265398899-1-dsc_2749_80_11zon.webp | rooms/anh-kim-hotel/standard-double/anh-kim-hotel-phong-standard-double-anh-02-m132.webp |
| website-media | rooms/anh-kim-hotel/standard-double/1790265399700-2-dsc_2750_81_11zon.webp | rooms/anh-kim-hotel/standard-double/anh-kim-hotel-phong-standard-double-anh-03-m133.webp |
| website-media | rooms/anh-kim-hotel/standard-double/1790265400316-3-dsc_2751_82_11zon.webp | rooms/anh-kim-hotel/standard-double/anh-kim-hotel-phong-standard-double-anh-04-m134.webp |
| website-media | rooms/anh-kim-hotel/standard-double/1790265401524-4-dsc_2752_83_11zon.webp | rooms/anh-kim-hotel/standard-double/anh-kim-hotel-phong-standard-double-anh-05-m135.webp |
| website-media | rooms/anh-kim-hotel/standard-double/1790265402368-5-dsc_2753_84_11zon.webp | rooms/anh-kim-hotel/standard-double/anh-kim-hotel-phong-standard-double-anh-06-m136.webp |
| website-media | rooms/anh-kim-hotel/standard-double/1790265402955-6-dsc_2754_85_11zon.webp | rooms/anh-kim-hotel/standard-double/anh-kim-hotel-phong-standard-double-anh-dai-dien-07-m137.webp |
| website-media | rooms/anh-kim-hotel/standard-double/1790265404087-7-dsc_2756_86_11zon.webp | rooms/anh-kim-hotel/standard-double/anh-kim-hotel-phong-standard-double-anh-08-m138.webp |
| website-media | activities/1-chup-hinh-cung-khach/1790348813492-3826e610-596b-48fb-992e-13c0988616cc.webp | activities/1-chup-hinh-cung-khach/huyens-hotels-stays-chup-hinh-cung-khach-anh-dai-dien-01-m146.webp |
| website-media | hotels/ae-guesthouse/1790826992973-0-mattien_53_11zon_14_11zon.webp | hotels/ae-guesthouse/ae-guesthouse-khach-san-anh-dai-dien-01-m147.webp |
| website-media | rooms/ae-guesthouse/double-balcony/1790827157316-0-_hkt0818_9_11zon.webp | rooms/ae-guesthouse/double-balcony/ae-guesthouse-phong-doi-co-ban-cong-rong-anh-01-m148.webp |
| website-media | rooms/ae-guesthouse/double-balcony/1790827158682-1-_hkt0822_10_11zon.webp | rooms/ae-guesthouse/double-balcony/ae-guesthouse-phong-doi-co-ban-cong-rong-anh-dai-dien-02-m149.webp |
| website-media | rooms/ae-guesthouse/double-balcony/1790827159959-2-_hkt0824_27_11zon_1_11zon.webp | rooms/ae-guesthouse/double-balcony/ae-guesthouse-phong-doi-co-ban-cong-rong-anh-03-m150.webp |
| website-media | rooms/ae-guesthouse/double-balcony/1790827160546-3-_hkt0827_28_11zon_2_11zon.webp | rooms/ae-guesthouse/double-balcony/ae-guesthouse-phong-doi-co-ban-cong-rong-anh-04-m151.webp |
| website-media | rooms/ae-guesthouse/double-balcony/1790827161454-4-_hkt0829_29_11zon_3_11zon.webp | rooms/ae-guesthouse/double-balcony/ae-guesthouse-phong-doi-co-ban-cong-rong-anh-05-m152.webp |
| website-media | rooms/ae-guesthouse/double-balcony/1790827161943-5-_hkt0830_16_11zon.webp | rooms/ae-guesthouse/double-balcony/ae-guesthouse-phong-doi-co-ban-cong-rong-anh-06-m153.webp |
| website-media | rooms/ae-guesthouse/double-balcony/1790827162785-6-_hkt0834_30_11zon_4_11zon.webp | rooms/ae-guesthouse/double-balcony/ae-guesthouse-phong-doi-co-ban-cong-rong-anh-07-m154.webp |
| website-media | rooms/ae-guesthouse/double-balcony/1790827163442-7-_hkt0837_31_11zon_5_11zon.webp | rooms/ae-guesthouse/double-balcony/ae-guesthouse-phong-doi-co-ban-cong-rong-anh-08-m155.webp |
| website-media | rooms/ae-guesthouse/family-room/1790827488396-0-_hkt0807_1_11zon_1_11zon.webp | rooms/ae-guesthouse/family-room/ae-guesthouse-phong-family-cho-3-nguoi-anh-dai-dien-01-m156.webp |
| website-media | rooms/ae-guesthouse/family-room/1790827489610-1-_hkt0809_2_11zon_2_11zon.webp | rooms/ae-guesthouse/family-room/ae-guesthouse-phong-family-cho-3-nguoi-anh-02-m157.webp |
| website-media | rooms/ae-guesthouse/family-room/1790827490732-2-_hkt0810_3_11zon_3_11zon.webp | rooms/ae-guesthouse/family-room/ae-guesthouse-phong-family-cho-3-nguoi-anh-03-m158.webp |
| website-media | rooms/ae-guesthouse/family-room/1790827491244-3-_hkt0811_4_11zon_4_11zon.webp | rooms/ae-guesthouse/family-room/ae-guesthouse-phong-family-cho-3-nguoi-anh-04-m159.webp |
| website-media | rooms/ae-guesthouse/family-room/1790827491726-4-_hkt0812_5_11zon_5_11zon.webp | rooms/ae-guesthouse/family-room/ae-guesthouse-phong-family-cho-3-nguoi-anh-05-m160.webp |
| website-media | rooms/ae-guesthouse/family-room/1790827492226-5-_hkt0813_6_11zon_6_11zon.webp | rooms/ae-guesthouse/family-room/ae-guesthouse-phong-family-cho-3-nguoi-anh-06-m161.webp |
| website-media | rooms/ae-guesthouse/family-room/1790827492710-6-_hkt0814_7_11zon_7_11zon.webp | rooms/ae-guesthouse/family-room/ae-guesthouse-phong-family-cho-3-nguoi-anh-07-m162.webp |
| website-media | rooms/ae-guesthouse/family-room/1790827493217-7-_hkt0815_8_11zon_8_11zon.webp | rooms/ae-guesthouse/family-room/ae-guesthouse-phong-family-cho-3-nguoi-anh-08-m163.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827658668-0-_hkt0806_33_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-dai-dien-01-m164.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827660214-1-_hkt0818_39_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-02-m165.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827662654-2-_hkt0865_40_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-03-m166.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827663328-3-_hkt0867_41_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-04-m167.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827664300-4-_hkt0868_19_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-05-m168.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827666069-5-_hkt0869_42_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-06-m169.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827667290-6-_hkt0872_43_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-07-m170.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827668000-7-_hkt0873_44_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-08-m171.webp |
| website-media | rooms/ae-guesthouse/deluxe-windown/1790827668665-8-_hkt0874_45_11zon.webp | rooms/ae-guesthouse/deluxe-windown/ae-guesthouse-phong-giuong-doi-co-cua-so-anh-09-m172.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827795820-0-_hkt0878_32_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-01-m173.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827798095-1-_hkt0879_56_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-dai-dien-02-m174.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827799362-2-_hkt0880_34_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-03-m175.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827800827-3-_hkt0881_35_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-04-m176.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827802490-4-_hkt0883_36_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-05-m177.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827803652-5-_hkt0883_59_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-06-m178.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827804693-6-_hkt0884_37_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-07-m179.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827805926-7-_hkt0885_38_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-08-m180.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827807304-8-_hkt0887_39_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-09-m181.webp |
| website-media | rooms/ae-guesthouse/eco-double/1790827808108-9-chatgpt-image-jan-1-2026-05_16_25-pm_48_11zon.webp | rooms/ae-guesthouse/eco-double/ae-guesthouse-phong-doi-hang-tiet-kiem-anh-10-m182.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854668456-0-chatgpt-image-17_43_21-3-thg-1-2026_1_11zon_1_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-01-m183.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854669117-1-chatgpt-image-17_56_58-3-thg-1-2026_2_11zon_2_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-02-m184.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854669549-2-chatgpt-image-jan-4-2026-07_49_07-am_3_11zon_3_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-03-m185.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854670097-3-chatgpt-image-jan-4-2026-07_53_55-am_4_11zon_4_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-04-m186.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854670743-4-dsc_2761_5_11zon_5_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-05-m187.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854671478-5-dsc_2762_6_11zon_6_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-06-m188.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854672021-6-dsc_2767_9_11zon_9_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-07-m189.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854672512-7-dsc_2769_10_11zon_10_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-dai-dien-08-m190.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854672984-8-dsc_2770_11_11zon_11_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-09-m191.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854673465-9-dsc_2772_12_11zon_12_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-10-m192.webp |
| website-media | rooms/anh-kim-hotel/family-room/1790854673916-10-dsc_2778_13_11zon_13_11zon.webp | rooms/anh-kim-hotel/family-room/anh-kim-hotel-phong-family-with-city-view-anh-11-m193.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855302376-0-2_15_11zon_1_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-01-m194.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855303001-1-3_16_11zon_2_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-02-m195.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855303685-2-chatgpt-image-16_52_55-3-thg-1-2026_19_11zon_3_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-03-m196.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855304155-3-chatgpt-image-16_55_44-3-thg-1-2026_20_11zon_4_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-04-m197.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855304887-4-chatgpt-image-jan-3-2026-05_05_49-pm_22_11zon_5_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-dai-dien-05-m198.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855305307-5-chatgpt-image-jan-3-2026-05_20_49-pm_25_11zon_7_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-06-m199.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855305724-6-dsc_2706-min_30_11zon_8_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-07-m200.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855306511-7-dsc_2707-min_31_11zon_9_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-08-m201.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855307061-8-dsc_2710-min_33_11zon_10_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-09-m202.webp |
| website-media | rooms/anh-kim-hotel/deluxe-double/1790855307630-9-dsc_2713-min_36_11zon_11_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-double-co-cua-so-anh-10-m203.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855899999-0-chatgpt-image-08_29_41-4-thg-1-2026_1_11zon_1_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-01-m204.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855901156-1-dsc_2725_6_11zon_2_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-dai-dien-02-m205.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855902074-2-dsc_2729_8_11zon_3_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-03-m206.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855902681-3-dsc_2730_9_11zon_4_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-04-m207.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855903168-4-dsc_2731_10_11zon_5_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-05-m208.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855903636-5-dsc_2733_11_11zon_6_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-06-m209.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855904152-6-dsc_2735_12_11zon_7_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-07-m210.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855904617-7-dsc_2738_13_11zon_8_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-08-m211.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855905099-8-dsc_2739_14_11zon_9_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-09-m212.webp |
| website-media | rooms/anh-kim-hotel/deluxe double/1790855905588-9-dsc_2741_16_11zon_11_11zon.webp | rooms/anh-kim-hotel/deluxe-double/anh-kim-hotel-phong-deluxe-double-co-ban-cong-anh-10-m213.webp |
| website-media | rooms/huyenhomestay/huyen-double/1790860226813-0-_hkt5626_14_11zon.webp | rooms/huyenhomestay/huyen-double/huyenhomestay-phong-double-co-san-anh-01-m214.webp |
| website-media | rooms/huyenhomestay/huyen-double/1790860227773-1-_hkt5628_15_11zon.webp | rooms/huyenhomestay/huyen-double/huyenhomestay-phong-double-co-san-anh-dai-dien-02-m215.webp |
| website-media | rooms/huyenhomestay/huyen-double/1790860228428-2-_hkt5630_16_11zon.webp | rooms/huyenhomestay/huyen-double/huyenhomestay-phong-double-co-san-anh-03-m216.webp |
| website-media | rooms/huyenhomestay/huyen-double/1790860229136-3-_hkt5631_17_11zon.webp | rooms/huyenhomestay/huyen-double/huyenhomestay-phong-double-co-san-anh-04-m217.webp |
| website-media | rooms/huyenhomestay/huyen-double/1790860229939-4-_hkt5633_18_11zon.webp | rooms/huyenhomestay/huyen-double/huyenhomestay-phong-double-co-san-anh-05-m218.webp |
| website-media | rooms/huyenhomestay/huyen-double/1790860230569-5-_hkt5634_19_11zon.webp | rooms/huyenhomestay/huyen-double/huyenhomestay-phong-double-co-san-anh-06-m219.webp |
| website-media | rooms/huyenhomestay/huyen-double/1790860231746-6-_hkt5637_20_11zon.webp | rooms/huyenhomestay/huyen-double/huyenhomestay-phong-double-co-san-anh-07-m220.webp |
| website-media | rooms/huyenhomestay/private-room/1790860646132-0-huyenhomestay-bed.webp | rooms/huyenhomestay/private-room/huyenhomestay-phong-double-co-cua-so-anh-01-m221.webp |
| website-media | rooms/huyenhomestay/private-room/1790860646569-1-huyenhomestay-bedroom.webp | rooms/huyenhomestay/private-room/huyenhomestay-phong-double-co-cua-so-anh-dai-dien-02-m222.webp |
| website-media | rooms/huyenhomestay/private-room/1790860647121-2-huyenhomestay-bed-roon.webp | rooms/huyenhomestay/private-room/huyenhomestay-phong-double-co-cua-so-anh-03-m223.webp |
| website-media | rooms/huyenhomestay/private-room/1790860647554-3-huyenhomestay-lingving-room.webp | rooms/huyenhomestay/private-room/huyenhomestay-phong-double-co-cua-so-anh-04-m224.webp |
| website-media | rooms/huyenhomestay/private-room/1790860647989-4-huyenhomestay-toilet.webp | rooms/huyenhomestay/private-room/huyenhomestay-phong-double-co-cua-so-anh-05-m225.webp |
| website-media | rooms/huyenhomestay/private-room/1790860648415-5-huyenhomestay-toilet-room.webp | rooms/huyenhomestay/private-room/huyenhomestay-phong-double-co-cua-so-anh-06-m226.webp |
| hero-images | hero-1-1790508667264.webp | hero/huyens-hotels-stays-khach-san-homestay-can-ho-dich-vu-tai-thanh-pho-ho-chi-minh-hero-1-hero-slides-1.webp |
| hero-images | hero-2-1790507254269.webp | hero/huyens-hotels-stays-mot-noi-nghi-ngoi-that-tron-ven-hero-2-hero-slides-2.webp |
| hero-images | hero-4-1790507273441.webp | hero/huyens-hotels-stays-hanh-trinh-cua-ban-lua-chon-cua-ban-hero-4-hero-slides-4.webp |
| hero-images | hero-3-1790826954590.webp | hero/huyens-hotels-stays-khach-san-tp-hcm-hero-3-hero-slides-5.webp |
| website-media | hero/hero-1-1790246000719-8kryatqm.webp | hero/huyens-hotels-stays-o-dau-cung-nhu-o-nha-hero-1-homepage-hero-1.webp |
| website-media | hero/hero-2-1790246004515-vzdh9rj7.webp | hero/huyens-hotels-stays-moi-noi-o-la-mot-dau-an-rieng-hero-2-homepage-hero-2.webp |
| website-media | hero/hero-3-1790246026928-dh86tnfn.webp | hero/huyens-hotels-stays-thoai-mai-theo-cach-cua-ban-hero-3-homepage-hero-3.webp |
| website-media | hero/hero-4-1790246038874-uy3vto62.webp | hero/huyens-hotels-stays-mot-mai-nha-thu-hai-hero-4-homepage-hero-4.webp |
| blog-images | blog/nhung-dieu-nen-biet-khi-du-lich-ho-chi-minh-city-1790856616023-d952dd13-e931-4adf-9e36-9d50e4c6a096.jfif | blog/nhung-dieu-nen-biet-khi-du-lich-ho-chi-minh-city-anh-bai-viet-b1.jpg |
| blog-images | blog/an-gi-o-trung-tam-tp-ho-chi-minh-1790856456160-760a5c5c-60a1-4d2a-8977-428a90838729.jpg | blog/an-gi-o-trung-tam-tp-ho-chi-minh-anh-bai-viet-b2.jpg |
| blog-images | blog/mot-ngay-song-cham-o-ho-chi-minh-city-1790856557808-3ec7b4ed-a4a1-4830-83b5-23d5801c9345.jpeg | blog/mot-ngay-song-cham-o-ho-chi-minh-city-anh-bai-viet-b3.jpg |
| blog-images | blog/kinh-nghiem-khi-luu-tru-tai-sai-gon-1790858367448-949e7a75-0699-42c3-bb90-9b855f35908b.jfif | blog/kinh-nghiem-khi-luu-tru-tai-sai-gon-anh-bai-viet-b4.jpg |
| blog-images | blog/kinh-nghiem-chon-khach-san-o-quan-1-1791388446438-be3d2888-2a16-4298-9db3-20a93e362b25.webp | blog/kinh-nghiem-chon-khach-san-o-quan-1-anh-bai-viet-b5.webp |
| blog-images | blog/khach-san-gan-cho-ben-thanh-1791388729327-6c6a0c53-287b-4495-be90-ed02ae42a4b7.jpg | blog/khach-san-gan-cho-ben-thanh-anh-bai-viet-b6.jpg |

Kiểm tra live cuối: trang chủ, trang Anh Kim và bài blog gần chợ Bến Thành trả HTTP 200 và đã có tên ảnh mới trong HTML. Logo mới và quy tắc upload mới vẫn cần deploy code.
