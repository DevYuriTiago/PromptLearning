import { progressService, authService } from './supabaseService';

class AnalyticsService {
  async getUserProgress(userId) {
    try {
      const progress = await progressService.getStudentProgress(userId);
      return {
        completedModules: progress.filter(p => p.completed).length,
        totalModules: progress.length,
        lastAccess: progress.length > 0 ? 
          Math.max(...progress.map(p => new Date(p.last_access).getTime())) : 
          null
      };
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      throw error;
    }
  }

  async getClassProgress(classId) {
    try {
      const { data: users } = await authService.getCurrentUser();
      const students = users.filter(user => user.role === 'student');
      
      const studentsProgress = await Promise.all(
        students.map(async student => {
          const progress = await progressService.getStudentProgress(student.id);
          return {
            studentId: student.id,
            studentName: student.email,
            completedModules: progress.filter(p => p.completed).length,
            totalModules: progress.length
          };
        })
      );

      return {
        totalStudents: students.length,
        averageCompletion: studentsProgress.reduce((acc, curr) => {
          return acc + (curr.completedModules / curr.totalModules * 100);
        }, 0) / studentsProgress.length,
        studentsProgress
      };
    } catch (error) {
      console.error('Erro ao buscar progresso da turma:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
