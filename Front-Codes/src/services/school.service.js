// src/services/school.service.js
import apiClient from './api.client';

export const schoolService = {
  // ─── مدارس ───
  getSchools: async (params = {}) => {
    const response = await apiClient.get('/schools', { params });
    return response.data;
  },
  getSchool: async (id) => {
    const response = await apiClient.get(`/schools/${id}`);
    return response.data;
  },
  createSchool: async (data) => {
    const response = await apiClient.post('/schools', data);
    return response.data;
  },
  updateSchool: async (id, data) => {
    const response = await apiClient.put(`/schools/${id}`, data);
    return response.data;
  },
  deleteSchool: async (id) => {
    const response = await apiClient.delete(`/schools/${id}`);
    return response.data;
  },

  // ─── کلاس‌ها ───
  getSchoolClasses: async (schoolId) => {
    const response = await apiClient.get(`/schools/${schoolId}/classes`);
    return response.data;
  },
  getClass: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}`);
    return response.data;
  },
  createClass: async (schoolId, data) => {
    const response = await apiClient.post(`/schools/${schoolId}/classes`, data);
    return response.data;
  },
  // افزودن/حذف معلم به کلاس
  addClassTeacher: async (classId, teacherId, isPrimary = false) => {
    const response = await apiClient.post(`/classes/${classId}/teachers`, {
      teacherId,
      isPrimary,
    });
    return response.data;
  },
  removeClassTeacher: async (classId, teacherId) => {
    const response = await apiClient.delete(`/classes/${classId}/teachers/${teacherId}`);
    return response.data;
  },
  // افزودن/حذف دانش‌آموز به کلاس
  addClassStudent: async (classId, studentId) => {
    const response = await apiClient.post(`/classes/${classId}/students`, { studentId });
    return response.data;
  },
  removeClassStudent: async (classId, studentId) => {
    const response = await apiClient.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },

  // ─── کاربران ───
  getUsers: async (schoolId, params = {}) => {
    const response = await apiClient.get(`/schools/${schoolId}/users`, { params });
    return response.data;
  },
  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (schoolId, data) => {
    const response = await apiClient.post(`/schools/${schoolId}/users`, data);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
  getUserPassword: async (id) => {
    const response = await apiClient.get(`/users/${id}/password`);
    return response.data;
  },
  resetUserPassword: async (id) => {
    const response = await apiClient.post(`/users/${id}/reset-password`);
    return response.data;
  },
};

export default schoolService;
