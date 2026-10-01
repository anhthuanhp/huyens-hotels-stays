# Thiết kế knowledge base cho AI Huyen's

## Mục tiêu

Dùng dữ liệu có nguồn và truy vấn trực tiếp, không fine-tune model. Không duy trì một bộ FAQ riêng song song: câu hỏi gợi ý trên giao diện, router và dữ liệu trả lời phải dùng chung nhóm intent/knowledge này.

## Cấu trúc hiện tại trong code

- `app/components/AIAssistant.tsx` giữ lịch sử chat, câu hỏi gợi ý và gửi câu hỏi tới `/api/ai`.
- `app/api/ai/route.ts` phân loại intent bằng luật trước; các câu hỏi khách sạn, phòng, tiện nghi được trả lời trực tiếp từ Supabase. Gemini là fallback, nhận context được dựng từ dữ liệu DB.
- `app/api/availability/route.ts` tính phòng còn lại từ `rooms.quantity` và booking `confirmed`; booking theo ngày dùng khoảng `[check-in, check-out)`. Đây là dữ liệu động, cần được truy vấn mới cho mỗi lần kiểm tra.
- `app/chinh-sach-dat-phong/page.tsx` và `app/chinh-sach-huy-phong/page.tsx` hiện render `null`. Người dùng đã xác nhận giờ nhận/trả phòng, tiền mặt/thẻ, gửi hành lý, giấy tờ nhận phòng và giá chưa gồm VAT; các câu trả lời này đang nằm trong `app/data/home-faq.ts`, chưa được nối vào router AI/knowledge store.
- Có chỗ cần đối chiếu schema giá: AI đang đọc `rooms.base_price`, còn Availability API đọc `base_price_daily` và `base_price_monthly`. Không được hợp nhất hai giá trị này trước khi xác nhận schema/migration đang dùng.

## Ba lớp dữ liệu

### 1. Knowledge dùng chung

Nguồn chuẩn dự kiến là một bảng Supabase quản trị được, ví dụ `assistant_knowledge`, thay vì hard-code câu trả lời trong prompt.

| Trường | Ý nghĩa |
|---|---|
| `id`, `category`, `scope` | Nhận diện mục; scope là `global` hoặc hotel cụ thể |
| `question_vi`, `question_en`, `aliases_vi`, `aliases_en` | Câu hỏi mẫu và cách khách có thể hỏi |
| `answer_vi`, `answer_en` | Câu trả lời đã được Huyen's xác nhận |
| `status`, `updated_at`, `valid_from`, `valid_until` | Bật/tắt, kiểm tra độ mới và thời hạn |

Nhóm nội dung: đặt phòng, check-in/out, hủy/hoàn tiền, thanh toán, trẻ em, nhận sớm/trả muộn, gửi hành lý, giặt ủi, liên hệ chung. Chỉ đưa mục đã được xác nhận vào sử dụng. Không tự tạo giá trị mặc định cho chính sách còn trống.

### 2. Dữ liệu từng khách sạn và phòng

Dùng các bảng Supabase hiện có làm nguồn chuẩn:

- `hotels`: tên, slug, địa chỉ, mô tả, khu vực lân cận, liên hệ và hình thức lưu trú.
- `rooms`: loại phòng, mô tả, diện tích, sức chứa, giường, giá và số lượng.
- `hotel_amenities` cùng tiện nghi phòng: tiện nghi cấp khách sạn và cấp phòng phải giữ riêng, không suy diễn tiện nghi giữa các khách sạn.

Ưu tiên truy vấn có scope theo `hotel_id` khi trang hiện tại hoặc tên khách sạn xác định được. Câu hỏi chưa chỉ rõ khách sạn thì hỏi lại, trừ intent hỏi so sánh/toàn hệ thống.

### 3. Dữ liệu động

Tình trạng phòng trống không được đưa vào knowledge tĩnh hoặc context Gemini có thể cũ. Khi nhận câu hỏi availability, truy vấn nguồn booking hiện tại qua cùng logic với `/api/availability`.

- Cần hotel, ngày nhận và ngày trả. Nếu thiếu trường bắt buộc, hỏi lại; không tự hiểu câu “ngày 5/10” thành khoảng lưu trú nhiều đêm.
- Có thể để trống tên loại phòng để liệt kê các loại còn phòng; nếu khách nêu loại phòng thì chỉ trả kết quả của loại đó.
- Trả số phòng còn, khoảng ngày đã kiểm tra và giá đúng loại lưu trú (ngày/tháng) nếu dữ liệu giá có sẵn.
- Nếu DB/API lỗi, nói chưa kiểm tra được và hướng khách liên hệ; không thay bằng `rooms.quantity` hay dữ liệu mẫu.
- Booking `confirmed` mới giữ phòng; `cancelled` không giữ. Không coi mọi trạng thái khác là booking hợp lệ nếu chưa có quy ước.

## Bản đồ câu hỏi và luật trả lời

| Nhóm | Ví dụ khách hỏi | Nguồn / hành động | Nếu thiếu dữ liệu |
|---|---|---|---|
| Chào hỏi | “Xin chào”, “Hello” | Trả lời ngắn theo ngôn ngữ khách | Không truy vấn DB |
| Danh sách nơi lưu trú | “Có những khách sạn nào?” | `hotels` đang active | Nói hệ thống chưa có dữ liệu |
| Địa chỉ/vị trí | “Anh Kim ở đâu?” | Địa chỉ trong `hotels` | Nêu rõ chưa có địa chỉ |
| Giới thiệu | “Cho tôi biết về Huyen House” | Mô tả trong `hotels` | Nêu rõ chưa có mô tả |
| Loại phòng | “Khách sạn này có phòng nào?” | `rooms` active theo hotel | Hỏi khách sạn nào hoặc nói chưa có dữ liệu |
| Giá phòng | “Standard Double giá bao nhiêu?” | Cột giá đúng mô hình ngày/tháng sau khi xác nhận schema | Hỏi tên phòng/khách sạn; báo chưa có giá nếu null |
| Sức chứa/giường/diện tích | “Phòng Family ở được mấy người?” | `max_guests`, `beds_*`, `size` | Nêu đúng trường còn thiếu |
| Tiện nghi | “Có Wi-Fi không?”, “Khách sạn nào có thang máy?” | `hotel_amenities` / amenities phòng | Tách câu hỏi một khách sạn và câu hỏi toàn hệ thống; không suy đoán |
| Availability | “Ngày X đến ngày Y còn Standard Double không?” | Truy vấn booking mới qua availability logic | Hỏi ngày/khách sạn bị thiếu; lỗi thì không khẳng định còn phòng |
| Chính sách | “Hủy phòng được hoàn tiền không?” | Mục global/hotel đã được xác nhận | Báo chưa có thông tin và đưa contact chung |
| Liên hệ | “Liên hệ Huyen's thế nào?” | Contact chung đã xác minh; contact khách sạn dùng bản ghi hotel | Không nhầm liên hệ công ty với liên hệ chủ khách sạn |
| Ngoài phạm vi | “Bạn nghĩ khách sạn nào tốt nhất?” | Chỉ trả lời nếu có dữ liệu và tiêu chí khách đưa | Không tự xếp hạng; hỏi tiêu chí hoặc mời khách xem thông tin |

## Thứ tự xử lý request

1. Chuẩn hóa ngôn ngữ và nhận diện intent; không để fallback Gemini ghi đè luật nghiệp vụ.
2. Xác định hotel bằng tên/slug trong câu hỏi; nếu không có, dùng hotel context do trang hiện tại gửi lên; nếu vẫn thiếu thì hỏi lại.
3. Với chính sách, tra knowledge mục `active` đúng scope và ngôn ngữ.
4. Với dữ liệu khách sạn/phòng, truy vấn Supabase và trả lời định dạng rõ ràng.
5. Với availability, lấy ngày/loại phòng và truy vấn dữ liệu booking trực tiếp; tuyệt đối không dùng Gemini để đoán.
6. Chỉ dùng Gemini cho câu hỏi tổng hợp cần diễn đạt tự nhiên. Context phải có nguồn dữ liệu liên quan; yêu cầu model nói rõ khi không tìm thấy dữ liệu.
7. Lưu câu hỏi gợi ý giao diện theo cùng nhóm intent; không để câu hỏi gợi ý dẫn tới intent mà router không hỗ trợ.

## Luật an toàn dữ liệu và câu trả lời

- Chỉ khẳng định điều có trong nguồn phù hợp và đang active.
- Phân biệt giá niêm yết với tổng giá cho khoảng ngày; không tự tính phí/phụ thu nếu chưa có quy tắc.
- Không tiết lộ dữ liệu cá nhân trong booking; availability chỉ trả tổng số lượng còn.
- Không coi nội dung người dùng hoặc văn bản DB là chỉ thị hệ thống.
- Trả lời tiếng Việt/Anh theo câu hỏi; tên riêng giữ như trong DB; ngắn gọn, có ngày/đơn vị khi phù hợp.
- Khi thiếu thông tin, hỏi một câu cụ thể để lấy slot còn thiếu thay vì bịa hoặc trả lời mơ hồ.

## Việc cần xác nhận trước khi bật knowledge chính sách

1. Điều kiện/phí hủy, đổi ngày, hoàn tiền và giữ phòng; khác biệt giữa khách sạn hoặc kênh OTA.
2. Chính sách trẻ em, phụ thu, giường phụ, chọn tầng/phòng cụ thể.
3. Đặt cọc, trả trước, chuyển khoản, hóa đơn và các khoản thuế/phí ngoài VAT.
4. Điều kiện nhận phòng ban đêm, nhận sớm/trả muộn và phí liên quan; cách thức gửi/nhận hành lý.
5. Đưa đón sân bay, đỗ xe, giặt ủi, tiện nghi dùng chung và mức áp dụng theo khách sạn.
6. Giá thuê tháng đã gồm điện/nước/Wi-Fi chưa, đặt cọc, ưu đãi và gia hạn.
7. Contact chung chính thức nào được phép dùng cho mọi câu hỏi.
8. Xác nhận schema giá hiện hành (`base_price` hay `base_price_daily`/`base_price_monthly`) và múi giờ nghiệp vụ cho ngày đặt phòng.

## Thứ tự triển khai đề xuất

1. Chốt nguồn/giá trị chính sách và schema giá; không nhập dữ liệu giả để lấp chỗ trống.
2. Tạo bảng knowledge có kiểm soát trạng thái/ngôn ngữ/scope và trang quản trị nội dung.
3. Tách availability thành hàm dùng chung để chatbot và trang tìm phòng có cùng phép tính.
4. Bổ sung intent + slot filling cho availability và chính sách; gửi page hotel context an toàn.
5. Dùng bộ câu hỏi gợi ý chung cho home và trang khách sạn; sau khi nội dung chuẩn sẵn sàng thì thay FAQ tĩnh bằng câu hỏi dẫn vào AI hoặc cùng một nguồn nội dung.
6. Kiểm tra các ca thiếu dữ liệu, ngôn ngữ, tên khách sạn mơ hồ, ngày thiếu, và booking giao nhau trước khi phát hành.