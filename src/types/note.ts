export interface Note {
  text: string;
  updatedAt?: string;
}

export interface NotesMap {
  [concept: string]: Note;
}
