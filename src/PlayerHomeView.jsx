import AnnouncementsFeed from './AnnouncementsFeed';
import StickyNotes from './StickyNotes';

function PlayerHomeView() {
  return (
    <div className="page-content" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', maxWidth: 'none' }}>
      <div style={{ flex: 1, maxWidth: '900px' }}>
        <AnnouncementsFeed />
      </div>
      <StickyNotes />
    </div>
  );
}

export default PlayerHomeView;