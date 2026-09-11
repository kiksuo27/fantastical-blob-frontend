import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './Login';
import Sidebar from './Sidebar';
import PlayerSidebar from './PlayerSidebar';
import RosterView from './RosterView';
import ScoresView from './ScoresView';
import ProfileView from './ProfileView';
import AssessmentView from './AssessmentView';
import PlayerDetailView from './PlayerDetailView';
import PartnersView from './PartnersView';
import ProgrammingView from './ProgrammingView';
import DashboardView from './DashboardView';
import CalendarView from './CalendarView';
import CourseDetailView from './CourseDetailView';
import ModuleDetailView from './ModuleDetailView';
import StaffManagementView from './StaffManagementView';
import StaffAssessmentView from './StaffAssessmentView';
import StaffDutiesView from './StaffDutiesView';
import StaffTrackerView from './StaffTrackerView';
import TrackerItemListView from './TrackerItemListView';
import TrackerItemDetailView from './TrackerItemDetailView';
import ProjectBoardsView from './ProjectBoardsView';
import ProjectBoardDetailView from './ProjectBoardDetailView';
import StaffRosterView from './StaffRosterView';
import DashboardTopBar from './DashboardTopBar';
import AssessmentManageView from './AssessmentManageView';
import PlayerTopBar from './PlayerTopBar';
import PlayerHomeView from './PlayerHomeView';
import AnnouncementsManageView from './AnnouncementsManageView';
import GroupsView from './GroupsView';
import GroupDetailView from './GroupDetailView';
import PartnerCategoryView from './PartnerCategoryView';
import PartnerDetailView from './PartnerDetailView';
import ArchiveView from './ArchiveView';
import AuditLogView from './AuditLogView';
import TouchpointsView from './TouchpointsView';
import AttemptDetailView from './AttemptDetailView';
import CommunityServiceView from './CommunityServiceView';
import CommunityServiceAdminView from './CommunityServiceAdminView';
import SurveysView from './SurveysView';

function App() {
  const { token, currentUser, logout, loading } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isPlayerHome = location.pathname === '/home';

  if (loading) {
    return <div className="app"><p>Loading...</p></div>;
  }

  if (!token) {
    return <Login />;
  }


  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="app-shell">
        {isPlayerHome && <PlayerTopBar />}
      <div className="admin-layout">
        <PlayerSidebar logout={logout} />
        <div className="main-content">
          <Routes>
            <Route path="/home" element={<PlayerHomeView />} />
            <Route path="/profile" element={<ProfileView currentUser={currentUser} token={token} />} />
            <Route path="/assessment" element={<AssessmentView />} />
            <Route path="/assessment/:assessmentId" element={<AssessmentView />} />
            <Route path="/programming" element={<ProgrammingView contentType="programming" pageTitle="Programming" />} />
            <Route path="/programming/:courseId" element={<CourseDetailView />} />
            <Route path="/programming/:courseId/modules/:moduleId" element={<ModuleDetailView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/community-service" element={<CommunityServiceView />} />
            <Route path="/surveys" element={<SurveysView />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </div>
      </div>
    </div>
    );
  }
return (
  <div className="app-shell">
    {isDashboard && <DashboardTopBar />}
    <div className="admin-layout">
      <Sidebar logout={logout} />
      <div className="main-content">
        <Routes>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/roster" element={<RosterView />} />
          <Route path="/roster/:playerId" element={<PlayerDetailView />} />
          <Route path="/scores" element={<ScoresView />} />
          <Route path="/partners" element={<PartnersView />} />
          <Route path="/partners" element={<PartnersView />} />
          <Route path="/partners/detail/:partnerId" element={<PartnerDetailView />} />
          <Route path="/partners/:categoryId" element={<PartnerCategoryView />} />
          <Route path="/programming" element={<ProgrammingView contentType="programming" pageTitle="Programming" />} />
          <Route path="/programming/:courseId" element={<CourseDetailView />} />
          <Route path="/programming/:courseId/modules/:moduleId" element={<ModuleDetailView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/staff" element={<StaffManagementView />} />
          <Route path="/staff/assessment" element={<StaffAssessmentView />} />
          <Route path="/staff/duties" element={<StaffDutiesView />} />
          <Route path="/staff/tracker" element={<StaffTrackerView />} />
          <Route path="/staff/tracker/:itemType" element={<TrackerItemListView />} />
          <Route path="/staff/tracker/:itemType/:itemId" element={<TrackerItemDetailView />} />
          <Route path="/staff/roster" element={<StaffRosterView />} />
          <Route path="/staff/assessment" element={<StaffAssessmentView />} />
          <Route path="/staff/assessment/:assessmentId" element={<AssessmentView />} />
          <Route path="/assessments/:assessmentId/manage" element={<AssessmentManageView />} />
          <Route path="/assessments/:assessmentId/users/:userId/attempt" element={<AttemptDetailView />} />
          <Route path="/staff/assessment/:assessmentId/manage" element={<AssessmentManageView />} />
          <Route path="/project-boards" element={<ProjectBoardsView />} />
          <Route path="/project-boards/:boardId" element={<ProjectBoardDetailView />} />
          <Route path="/announcements" element={<AnnouncementsManageView />} />
          <Route path="/groups" element={<GroupsView />} />
          <Route path="/groups/:groupId" element={<GroupDetailView />} />
          <Route path="/archive" element={<ArchiveView />} />
          <Route path="/audit-log" element={<AuditLogView />} />
          <Route path="/touchpoints" element={<TouchpointsView />} />
          <Route path="/community-service" element={<CommunityServiceAdminView />} />
          <Route path="/surveys" element={<SurveysView />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  </div>
);
}

export default App;
