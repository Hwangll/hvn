interface ProfileNoteProps {
  name: string;
  detail: string;
  position: "left" | "right";
}

export function ProfileNote({ name, detail, position }: ProfileNoteProps) {
  return (
    <div className={`profile-note profile-note-${position}`}>
      <span>{name}</span>
      <small>{detail}</small>
    </div>
  );
}
