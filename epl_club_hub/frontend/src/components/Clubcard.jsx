import { Link } from "react-router-dom";

function ClubCard({ club }) {
  return (
    <Link to={`/clubs/${club.id}`} className="club-card-react">
      <div className="club-card-react-media">
        <img
          className="club-logo-react"
          src={
            club.logo_url
              ? club.logo_url
              : "https://placehold.co/220x220?text=Club+Logo"
          }
          alt={club.name}
        />
      </div>

      <div className="club-card-react-body">
        <h3>{club.name}</h3>
        <p><strong>약칭:</strong> {club.short_name}</p>
        <p><strong>감독:</strong> {club.manager}</p>
        <p><strong>홈구장:</strong> {club.stadium}</p>
      </div>
    </Link>
  );
}

export default ClubCard;