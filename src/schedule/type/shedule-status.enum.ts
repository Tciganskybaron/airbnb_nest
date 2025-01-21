export enum ScheduleStatus {
	/** Room is reserved but not yet confirmed */
	Reserved = 'reserved',

	/** Booking is confirmed but not yet paid */
	Confirmed = 'confirmed',

	/** Booking is fully paid */
	Paid = 'paid',

	/** Guest has checked into the room */
	CheckedIn = 'checked_in',

	/** Guest has checked out of the room */
	CheckedOut = 'checked_out',

	/** Booking has been canceled */
	Cancelled = 'cancelled',

	/** Booking has been canceled with a refund issued */
	Refunded = 'refunded',

	/** Guest did not show up for the booking */
	NoShow = 'no_show',
}
