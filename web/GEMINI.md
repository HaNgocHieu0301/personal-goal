# **TÀI LIỆU ĐỊNH NGHĨA SẢN PHẨM: PERSONAL GOAL OS (Hệ điều hành Mục tiêu Cá nhân)**

## **1\. TẦM NHÌN SẢN PHẨM (Vision)**

Xây dựng một nền tảng quản trị mục tiêu cá nhân giúp người dùng thu hẹp khoảng cách giữa "Lập kế hoạch" và "Thực hiện". Hệ thống tập trung vào việc quản lý sự tập trung (Focus Management) hơn là chỉ quản lý công việc (Task Management), thông qua cơ chế phân rã mục tiêu nguyên tử và kỷ luật thép.

## **2\. ĐỐI TƯỢNG & NỖI ĐAU (Target Audience & Pain Points)**

* **Đối tượng:** Developer, High-performers, những người có mục tiêu lớn nhưng thường xuyên rơi vào trạng thái trì hoãn hoặc mất định hướng giữa chừng.  
* **Nỗi đau:**  
  * Mục tiêu quá lớn gây choáng ngợp (Analysis Paralysis).  
  * Động lực trồi sụt (Lúc hưng phấn, lúc lười biếng).  
  * Không có áp lực đủ lớn để duy trì kỷ luật khi làm việc một mình.  
  * Sao nhãng bởi những việc phụ, quên mất mục tiêu cốt lõi.

## **3\. CÁC TRỤ CỘT TÍNH NĂNG (Core Features)**

### **A. Mô-đun "Kiến trúc sư" (The Architect \- Planning)**

Dành cho trạng thái năng lượng cao, tập trung vào tư duy hệ thống.

* **Cấu trúc Cây Mục tiêu (Recursive Goal Tree):** Hỗ trợ phân cấp vô hạn: Mục tiêu lớn \> Cột mốc \> Đầu việc nhỏ \> Hành động nguyên tử.  
* **Trọng số Công việc (Weighting):** Mỗi đầu việc con có một trọng số (ví dụ: Task A chiếm 40% khối lượng của Milestone). Tiến độ cha sẽ được tính dựa trên tổng trọng số các việc con đã hoàn thành.  
* **Atomic Requirement:** Hệ thống đưa ra cảnh báo nếu một Task được dự báo tốn hơn 4 tiếng, yêu cầu người dùng tiếp tục break nhỏ.

### **B. Mô-đun "Chiến binh" (The Warrior \- Execution)**

Dành cho trạng thái làm việc hàng ngày, tối giản hóa lựa chọn.

* **The Big 3 View:** Dashboard chỉ hiển thị tối đa 3 việc quan trọng nhất phải hoàn thành trong ngày dựa trên độ ưu tiên và deadline.  
* **Keyboard-Centric UI:** Toàn bộ thao tác (thêm task, đổi trạng thái, chuyển view) có thể thực hiện qua phím tắt để giảm "ma sát" khi tương tác.  
* **Focus Mode:** Giao diện tối giản tuyệt đối khi đang thực hiện một task cụ thể.

### **C. Cơ chế Kỷ luật & Hình phạt (Discipline & Penalty)**

* **Thiết lập 3 cấp độ Kỷ luật:**  
  1. **Chill:** Chỉ theo dõi, không nhắc nhở.  
  2. **Standard:** Thông báo deadline, báo cáo tiến độ.  
  3. **Beast Mode:** Kích hoạt cơ chế "Digital Witness".  
* **Quỹ Tự Phạt (Self-Punishment Fund):** \- Người dùng cam kết một số tiền phạt cho mỗi lần trễ hạn ở Beast Mode.  
  * Khi trễ hạn: Toàn bộ Dashboard bị khóa (Overlay) cho đến khi người dùng xác nhận đã nộp phạt vào quỹ riêng và ghi lại "Lý do thất bại".

## **4\. CƠ CHẾ LOGIC & ĐO LƯỜNG (Logic & Metrics)**

### **4.1. Công thức tính tiến độ ($P$)**

Tiến độ của một mục tiêu được tính bằng tổng tích lũy của trạng thái hoàn thành ($c$) và trọng số ($w$):  
$$P \= \\frac{\\sum\_{i=1}^{n} (w\_i \\times c\_i)}{\\sum\_{i=1}^{n} w\_i} \\times 100\\%$$  
*Trong đó:* $c\_i \= 1$ *nếu hoàn thành,* $0$ *nếu chưa.*

### **4.2. Chỉ số Momentum (Đà năng suất)**

* Tính bằng số ngày liên tiếp hoàn thành ít nhất 1 task trong Big 3 (Streak).  
* Nếu đứt chuỗi, điểm Momentum sẽ giảm theo hàm mũ, tạo áp lực tâm lý để duy trì sự đều đặn.

## **5\. CHIẾN LƯỢC TRẢI NGHIỆM NGƯỜI DÙNG (UX Strategy)**

* **Giai đoạn 1: Private & Frictionless (Hiện tại)**  
  * Tập trung vào tốc độ nhập liệu.  
  * Chế độ Dark mode mặc định để tạo sự tập trung.  
  * Local storage/Private database đảm bảo tính riêng tư tuyệt đối.  
* **Giai đoạn 2: Social Accountability (Tương lai)**  
  * Shareable Dashboard: Link xem nhanh tiến độ để gửi cho "nguyên giám sát".  
  * Leaderboard: So sánh điểm Momentum với cộng đồng (tùy chọn).

## **6\. ĐỀ XUẤT CÔNG NGHỆ (Tech Stack)**

Dựa trên yêu cầu về hiệu suất, khả năng mở rộng và định hướng cá nhân, đây là bộ Tech Stack tối ưu:

### **6.1. Backend: Golang**

* **Framework:** **Gin** hoặc **Echo** (Ưu tiên Gin vì tính phổ biến và hiệu suất cực cao cho REST API).  
* **Tại sao:** Xử lý tốt các logic tính toán đệ quy cho cây mục tiêu, quản lý concurrency tốt cho hệ thống thông báo và cực kỳ nhẹ (lightweight).

### **6.2. Frontend: Next.js (React)**

* **UI Library:** **shadcn/ui** (dựa trên Radix UI) kết hợp với **Tailwind CSS**.  
* **Keyboard Interaction:** Sử dụng thư viện **KBar** hoặc **Command Palette** để hiện thực hóa trải nghiệm "Keyboard-Centric".  
* **Tại sao:** Next.js hỗ trợ tốt cho việc phát triển Dashboard, dễ dàng mở rộng thành sản phẩm thương mại với khả năng SEO tốt.

### **6.3. Database & Caching**

* **Primary DB:** **PostgreSQL**.  
  * *Tính năng quan trọng:* Sử dụng **Recursive CTE** (Common Table Expressions) để truy vấn toàn bộ cây mục tiêu chỉ với 1 câu query.  
* **Caching/Store:** **Redis**.  
  * *Sử dụng:* Lưu trữ Streak, Momentum Score và các session tạm thời để tăng tốc độ truy xuất Dashboard.

### **6.4. Infrastructure & DevOps**

* **Deployment:** **Docker** \+ **AWS (ECS/Fargate)**.  
* **CI/CD:** **GitHub Actions**.  
* **Storage:** **AWS S3** (dành cho các file bằng chứng nộp phạt hoặc profile nếu có).

### **6.5. Additional Tools**

* **CLI Tool:** Go (sử dụng thư viện **Cobra**) để điều khiển mục tiêu trực tiếp từ Terminal.  
* **Charts:** **Recharts** hoặc **Tremor** để vẽ biểu đồ tiến độ và Heatmap.

## **7\. LỘ TRÌNH TRIỂN KHAI (Roadmap)**

### **Giai đoạn 1: Minimal Viable Product (MVP) - [COMPLETED]**

* [x] Xây dựng Core Engine: Tạo và quản lý cây mục tiêu.  
* [x] Implement logic tính % tiến độ dựa trên trọng số.  
* [x] Dashboard "The Big 3".

### **Giai đoạn 2: Discipline Engine**

* Tích hợp hệ thống Deadline và mức độ Kỷ luật.  
* Phát triển luồng "Xác nhận nộp phạt" và Nhật ký thất bại.  
* Heatmap theo dõi sự kiên trì (giống GitHub).

### **Giai đoạn 3: Optimization & Tools**

* Tối ưu hóa phím tắt toàn diện.  
* Viết CLI Tool (Go) để tương tác nhanh từ Terminal.  
* Hệ thống thông báo nhắc nhở qua trình duyệt/gmail/telegram.

## **8\. ĐÁNH GIÁ RỦI RO (Risk Assessment)**

* **Rủi ro:** Người dùng gian lận khi xác nhận nộp phạt.  
* **Giải pháp:** Bản chất ứng dụng là tự phục vụ bản thân. Việc lưu lại lịch sử "Gian lận" hoặc "Thất bại" chính là tấm gương phản chiếu để người dùng tự đối diện với kỷ luật của mình.

# IMPORTANT:
- Luôn luôn cập nhật những thay đổi vào docs