import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { staffService } from '@services/staff.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './StaffManagementPage.css';

const statusTone = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DELETED: 'neutral',
};

const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await staffService.getStaff();
        setStaffList(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách nhân sự.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa nhân sự này?')) {
      return;
    }

    try {
      await staffService.deleteStaff(userId);
      setStaffList((prev) => prev.filter((staff) => staff.userId !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa nhân sự.');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-staff">
        <section className="admin-staff__hero">
          <div>
            <span>Quản lý nhân sự</span>
            <h1>Đội ngũ vận hành trạm</h1>
            <p>Theo dõi thông tin nhân viên, trạng thái làm việc và phân quyền theo trạm.</p>
          </div>
          <Link to="/admin/staff/create" className="admin-staff__cta">
            + Thêm nhân sự
          </Link>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <div className="admin-staff__loading">
            <LoadingSpinner />
          </div>
        ) : staffList.length === 0 ? (
          <div className="admin-staff__empty">Chưa có nhân sự nào trong hệ thống.</div>
        ) : (
          <section className="admin-staff__table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nhân sự</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.userId}>
                    <td>#{staff.userId}</td>
                    <td>{staff.name || 'Chưa cập nhật'}</td>
                    <td>{staff.email}</td>
                    <td>{staff.phone || '—'}</td>
                    <td>
                      <span
                        className={`admin-staff__status admin-staff__status--${
                          statusTone[staff.status] || 'neutral'
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-staff__actions">
                        <Link to={`/admin/staff/${staff.userId}/edit`}>Chỉnh sửa</Link>
                        <button type="button" onClick={() => handleDelete(staff.userId)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default StaffManagementPage;

