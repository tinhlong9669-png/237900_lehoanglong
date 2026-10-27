import { useEffect, useState } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const empty = { employeeId: '', fullName: '', gender: 'Nam', dateOfBirth: '', department: '', position: '', email: '', phone: '', hireDate: '', status: 'Đang làm việc' };

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const notify = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000); };

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/employees?search=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Không tải được dữ liệu');
      setEmployees(await res.json());
    } catch (e) { notify('error', e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.fullName || !form.email) return notify('error', 'Vui lòng nhập mã NV, họ tên và email');
    try {
      const res = await fetch(`${API}/api/employees${editingId ? '/' + editingId : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
      notify('success', editingId ? 'Cập nhật thành công' : 'Thêm nhân viên thành công');
      setForm(empty); setEditingId(null); load(search);
    } catch (e) { notify('error', e.message); }
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setForm({ ...empty, ...emp });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Xóa nhân viên ${emp.fullName}?`)) return;
    try {
      const res = await fetch(`${API}/api/employees/${emp._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      notify('success', 'Đã xóa nhân viên'); load(search);
    } catch (e) { notify('error', e.message); }
  };

  return (
    <div className="container">
      <h1>Quản lý nhân sự</h1>
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="form">
        <input name="employeeId" placeholder="Mã nhân viên" value={form.employeeId} onChange={handleChange} />
        <input name="fullName" placeholder="Họ và tên" value={form.fullName} onChange={handleChange} />
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option>Nam</option><option>Nữ</option><option>Khác</option>
        </select>
        <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
        <input name="department" placeholder="Phòng ban" value={form.department} onChange={handleChange} />
        <input name="position" placeholder="Chức vụ" value={form.position} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
        <input type="date" name="hireDate" value={form.hireDate} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option>Đang làm việc</option><option>Nghỉ việc</option><option>Tạm nghỉ</option>
        </select>
        <button type="submit">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
        {editingId && <button type="button" onClick={() => { setForm(empty); setEditingId(null); }}>Hủy</button>}
      </form>

      <div className="search">
        <input placeholder="Tìm theo mã NV hoặc họ tên" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => load(search)}>Tìm kiếm</button>
        <button onClick={() => { setSearch(''); load(''); }}>Tất cả</button>
      </div>

      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table>
          <thead><tr>
            <th>Mã NV</th><th>Họ tên</th><th>Phòng ban</th><th>Chức vụ</th>
            <th>Email</th><th>SĐT</th><th>Trạng thái</th><th>Thao tác</th>
          </tr></thead>
          <tbody>
            {employees.length === 0 && <tr><td colSpan="8">Không có nhân viên</td></tr>}
            {employees.map((e) => (
              <tr key={e._id}>
                <td>{e.employeeId}</td><td>{e.fullName}</td><td>{e.department}</td><td>{e.position}</td>
                <td>{e.email}</td><td>{e.phone}</td><td>{e.status}</td>
                <td>
                  <button onClick={() => handleEdit(e)}>Sửa</button>
                  <button onClick={() => handleDelete(e)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}