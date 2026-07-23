import { useParams } from 'react-router-dom';
import CourseWorkspace from './CourseWorkspace';

export default function CourseWorkspacePage() {
  const { courseId } = useParams();
  return <CourseWorkspace role="teacher" courseId={courseId} />;
}
