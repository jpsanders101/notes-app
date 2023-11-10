interface Note {
  id: number,
  body: string,
  subject: string,
}

export interface NoteRequest {
  body: string,
  subject: string,
  userId: number,
}

interface User {
  id: Number,
  email: String,
  password: String,
  notes: [Note]
}

export interface LoginRequestBody {
  email: String,
  password: String,
}

export interface NotesData {
  user: User,
  notes: Note[]
}

export interface ErrorStatus {
  message: string,
  status: number,
}

export interface PageContext {
  userId?: number,
  email?: string,
  notes?: Note[]
}