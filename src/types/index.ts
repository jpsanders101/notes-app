interface User {
  username: String,
}

interface Note {
  title: String,
  body: String,
}

export interface NotesData {
  user: User,
  notes: Note[]
}