export interface IUser {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: 'alumni' | 'admin' | 'coordinator';
  createdAt: string;
}

export interface IAlumni {
  _id: string;
  userId: string;
  registerNumber: string;
  name: string;
  email: string;
  dob: string;
  yearFrom: number;
  yearTo: number;
  degree: string;
  branch: string;
  profilePhoto?: string;
  designation?: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  photos?: string[];
}

export interface IMail {
  _id: string;
  title: string;
  content: string;
  senderName: string;
  senderEmail: string;
  createdAt: string;
  recipientCount: number;
}
