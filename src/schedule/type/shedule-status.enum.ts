export enum ScheduleStatus {
	/** Room is reserved but not yet confirmed */
	Reserved = 'Reserved',

	/** Booking is confirmed but not yet paid */
	Confirmed = 'Confirmed',

	/** Booking is fully paid */
	Paid = 'Paid',

	/** Guest has checked into the room */
	CheckedIn = 'CheckedIn',

	/** Guest has checked out of the room */
	CheckedOut = 'CheckedOut',

	/** Booking has been canceled */
	Cancelled = 'Cancelled',

	/** Booking has been canceled with a refund issued */
	Refunded = 'Refunded',

	/** Guest did not show up for the booking */
	NoShow = 'NoShow',
}
