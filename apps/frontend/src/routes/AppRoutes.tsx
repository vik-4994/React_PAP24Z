import Subjects from '@frontend/pages/courses/Courses';
import HomePage from '@frontend/pages/Home';
import Layout from '@frontend/layouts/Layout';
import Login from '@frontend/pages/Login';
import Schedule from '@frontend/pages/timeslots/Timeslots';
import Schedule2 from '@frontend/pages/schedule/Schedule';
import PrivateRoute from '@frontend/routes/PrivateRoute';
import { Route, Routes } from 'react-router-dom';
import NotFound from '@frontend/pages/errors/NotFound';
import PreferencesPage from '@frontend/pages/exchange';
import AllExchangesPage from '@frontend/pages/allExchanges';
import CodePage from '@frontend/pages/СodePage';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<PrivateRoute />}>
      <Route element={<Layout />}>
        <Route index path="/" element={<HomePage />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule2" element={<Schedule2 />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/exchanges" element={<PreferencesPage />} />
        <Route path="/all-exchanges" element={<AllExchangesPage />} />
        <Route path="/enter-code" element={<CodePage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
