/**
 * Stands in for the photo that was never taken at the café: a paper bill from the stop,
 * where the line items and the staff's reminder carry the story instead of an image.
 */
export function CafeReceipt() {
  return (
    <div className="cafe-receipt" data-parallax="0.5" data-delay="0.42" data-sheen="1">
      <p className="cafe-receipt-head">
        <strong>CAFÉ HỒ TÂY</strong>
        <span>hoá đơn · điểm dừng 02</span>
      </p>
      <ul className="cafe-receipt-items">
        <li><span>2 × cà phê</span><b>đã gọi</b></li>
        <li><span>1 × ghế ngồi sát nhau</span><b>miễn phí</b></li>
        <li><span>0 × tấm ảnh</span><b>bận mất rồi</b></li>
      </ul>
      <p className="cafe-receipt-note">
        <span>lưu ý của quán</span>
        hai bạn giữ ý tứ giúp mình nhé
      </p>
      <p className="cafe-receipt-total">
        <span>tổng cộng</span>
        một buổi chiều không muốn về
      </p>
    </div>
  );
}
