interface Note {
  id: Number,
  body: String,
  subject: String,
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
  message: String,
  status: Number,
}

export interface PageContext {
  email?: String,
  notes?: Note[]
}