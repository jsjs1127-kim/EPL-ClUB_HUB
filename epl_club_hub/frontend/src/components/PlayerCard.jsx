import { Link } from "react-router-dom";

function PlayerCard({ player }) {
  return (
    <Link to={`/players/${player.id}`} className="player-card-link">
      <article className="player-card">
        <div className="card-top">
          <div className="shirt-number">{player.number}</div>
          <div className="club-chip">{player.club_name}</div>

          <img
            className="player-image"
            src={
              player.image_url
                ? player.image_url
                : "https://placehold.co/300x380?text=No+Image"
            }
            alt={player.name}
          />
        </div>

        <div className="card-body">
          <span className="position">{player.position}</span>
          <h3 className="player-name">{player.name}</h3>
          <p className="player-meta">
            {player.nationality} · {player.age}세
          </p>

          <div className="mini-stats">
            <div className="mini-stat">
              <div className="mini-stat-label">경기</div>
              <div className="mini-stat-value">{player.appearances}</div>
            </div>

            <div className="mini-stat">
              <div className="mini-stat-label">골</div>
              <div className="mini-stat-value">{player.goals}</div>
            </div>

            <div className="mini-stat">
              <div className="mini-stat-label">도움</div>
              <div className="mini-stat-value">{player.assists}</div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default PlayerCard;