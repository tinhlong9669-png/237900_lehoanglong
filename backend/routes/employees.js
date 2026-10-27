const router = require('express').Router();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

router.get('/', async (req, res) => {
  const { search } = req.query;
  const filter = search ? { $or: [
    { employeeId: new RegExp(search, 'i') },
    { fullName: new RegExp(search, 'i') } ] } : {};
  res.json(await Employee.find(filter).sort({ createdAt: -1 }));
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ' });
  const e = await Employee.findById(req.params.id);
  e ? res.json(e) : res.status(404).json({ message: 'Không tìm thấy nhân viên' });
});

router.post('/', async (req, res) => {
  const { employeeId, fullName, email } = req.body;
  if (!employeeId || !fullName || !email) return res.status(400).json({ message: 'Thiếu mã NV, họ tên hoặc email' });
  try { res.status(201).json(await Employee.create(req.body)); }
  catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Mã nhân viên đã tồn tại' });
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const e = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    e ? res.json(e) : res.status(404).json({ message: 'Không tìm thấy nhân viên' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  const e = await Employee.findByIdAndDelete(req.params.id);
  e ? res.json({ message: 'Đã xóa' }) : res.status(404).json({ message: 'Không tìm thấy nhân viên' });
});
module.exports = router;