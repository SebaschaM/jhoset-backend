export interface SuccessResponse<T> {
  statusCode: number;
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export interface UserResponse {
  user_id: number;
  username: string;
  email: string;
  name?: string;
  last_name?: string;
  isActive?: boolean;
}

export interface AttendanceResponse {
  attendance_id: number;
  user_id: number;
  check_in_time: string;
  date_marked: string;
  attendanceStatus_id: number;
}
