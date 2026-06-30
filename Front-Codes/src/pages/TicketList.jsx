// src/pages/TicketList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.client';
import { 
  HiOutlineTicket, 
  HiOutlinePlus, 
  HiOutlineChat,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineFilter,
  HiOutlineRefresh
} from 'react-icons/hi';

const TicketList = ({ user, colors, isMobile }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, answered, closed
  const [filterPriority, setFilterPriority] = useState('all'); // all, low, medium, high, critical

  // ========== بارگذاری تیکت‌ها ==========
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('v1/tickets');
      console.log('Tickets API response:', res.data);
      
      if (res.data.success) {
        const data = res.data.data || [];
        setTickets(Array.isArray(data) ? data : []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // ========== ارسال تیکت جدید ==========
  const handleSubmitTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      alert('لطفاً موضوع و متن تیکت را وارد کنید');
      return;
    }

    setUpdating(true);
    try {
      await apiClient.post('v1/tickets', newTicket);
      alert('✅ تیکت با موفقیت ارسال شد');
      setShowNewTicket(false);
      setNewTicket({ subject: '', message: '', priority: 'medium' });
      await loadTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert(error.response?.data?.message || 'خطا در ارسال تیکت');
    } finally {
      setUpdating(false);
    }
  };

  // ========== ارسال پاسخ به تیکت ==========
  const handleReply = async () => {
    if (!replyMessage.trim()) {
      alert('لطفاً متن پاسخ را وارد کنید');
      return;
    }

    setUpdating(true);
    try {
      await apiClient.post(`v1/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage
      });
      alert('✅ پاسخ با موفقیت ارسال شد');
      setReplyMessage('');
      setSelectedTicket(null);
      await loadTickets();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(error.response?.data?.message || 'خطا در ارسال پاسخ');
    } finally {
      setUpdating(false);
    }
  };

  // ====== تغییر وضعیت تیکت ======
  const handleStatusChange = async (ticketId, status) => {
    setUpdating(true);
    try {
      await apiClient.patch(`v1/tickets/${ticketId}/status`, { status });
      alert('✅ وضعیت تیکت تغییر کرد');
      await loadTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert(error.response?.data?.message || 'خطا در تغییر وضعیت');
    } finally {
      setUpdating(false);
    }
  };

  // ====== دریافت وضعیت تیکت ======
  const getStatusBadge = (status) => {
    const statusMap = {
      open: { label: 'باز', color: '#FF9800', icon: HiOutlineClock },
      answered: { label: 'پاسخ داده شده', color: '#4CAF50', icon: HiOutlineCheck },
      closed: { label: 'بسته', color: '#9E9E9E', icon: HiOutlineX }
    };
    const s = statusMap[status] || statusMap.open;
    const Icon = s.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: `${s.color}20`,
        color: s.color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '500'
      }}>
        <Icon size={12} />
        {s.label}
      </span>
    );
  };

  // ====== دریافت اولویت ======
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { label: 'کم', color: '#4CAF50' },
      medium: { label: 'متوسط', color: '#FF9800' },
      high: { label: 'بالا', color: '#F44336' },
      critical: { label: 'فوری', color: '#D32F2F' }
    };
    const p = priorityMap[priority] || priorityMap.medium;
    return (
      <span style={{
        background: `${p.color}20`,
        color: p.color,
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '500'
      }}>
        {p.label}
      </span>
    );
  };

  // ====== فرمت تاریخ ======
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ====== فیلتر کردن تیکت‌ها ======
  const getFilteredTickets = () => {
    let filtered = tickets;
    
    // فیلتر بر اساس وضعیت
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    // فیلتر بر اساس اولویت
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }
    
    return filtered;
  };

  // ====== آمار تیکت‌ها ======
  const getStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const answered = tickets.filter(t => t.status === 'answered').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const critical = tickets.filter(t => t.priority === 'critical').length;
    const high = tickets.filter(t => t.priority === 'high').length;
    
    return { total, open, answered, closed, critical, high };
  };

  const stats = getStats();
  const filteredTickets = getFilteredTickets();

  // ====== بررسی آیا ادمین هست ======
  const isAdmin = user?.role === 'team_admin' || user?.role === 'school_admin';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          width: '30px',
          height: '30px',
          border: `3px solid ${colors.primary}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '12px' }}>در حال بارگذاری تیکت‌ها...</p>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlineTicket size={20} color={colors.primary} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text }}>
            تیکت‌های پشتیبانی
          </h2>
          <span style={{
            background: colors.bg,
            color: colors.textSecondary,
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {tickets.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={loadTickets}
            style={{
              background: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: colors.textSecondary
            }}
          >
            <HiOutlineRefresh size={16} />
            بروزرسانی
          </button>
          <button
            onClick={() => setShowNewTicket(true)}
            style={{
              background: colors.primary,
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <HiOutlinePlus size={16} />
            تیکت جدید
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ background: colors.bg, borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: colors.primary }}>{stats.total}</div>
          <div style={{ fontSize: '10px', color: colors.textSecondary }}>کل</div>
        </div>
        <div style={{ background: '#FFF3E0', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9800' }}>{stats.open}</div>
          <div style={{ fontSize: '10px', color: colors.textSecondary }}>باز</div>
        </div>
        <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4CAF50' }}>{stats.answered}</div>
          <div style={{ fontSize: '10px', color: colors.textSecondary }}>پاسخ داده</div>
        </div>
        <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9E9E9E' }}>{stats.closed}</div>
          <div style={{ fontSize: '10px', color: colors.textSecondary }}>بسته</div>
        </div>
        <div style={{ background: '#FFEBEE', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#F44336' }}>{stats.high}</div>
          <div style={{ fontSize: '10px', color: colors.textSecondary }}>بالا</div>
        </div>
        <div style={{ background: '#FFCDD2', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#D32F2F' }}>{stats.critical}</div>
          <div style={{ fontSize: '10px', color: colors.textSecondary }}>فوری</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: `1px solid ${colors.primary}`,
            fontSize: '12px',
            background: 'white'
          }}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="answered">پاسخ داده شده</option>
          <option value="closed">بسته</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: `1px solid ${colors.primary}`,
            fontSize: '12px',
            background: 'white'
          }}
        >
          <option value="all">همه اولویت‌ها</option>
          <option value="low">کم</option>
          <option value="medium">متوسط</option>
          <option value="high">بالا</option>
          <option value="critical">فوری</option>
        </select>

        {(filter !== 'all' || filterPriority !== 'all') && (
          <button
            onClick={() => { setFilter('all'); setFilterPriority('all'); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.primary,
              cursor: 'pointer',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            ✕ حذف فیلتر
          </button>
        )}
      </div>

      {/* List */}
      {filteredTickets.length === 0 ? (
        <div style={{
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <HiOutlineTicket size={48} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
            {tickets.length === 0 ? 'هیچ تیکتی ثبت نشده است' : 'هیچ تیکتی با این فیلتر وجود ندارد'}
          </p>
          {tickets.length === 0 && (
            <button
              onClick={() => setShowNewTicket(true)}
              style={{
                marginTop: '12px',
                background: colors.primary,
                border: 'none',
                borderRadius: '10px',
                padding: '8px 20px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              ثبت تیکت جدید
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              style={{
                background: colors.cardBg,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: ticket.status === 'open' && ticket.priority === 'critical' 
                  ? `2px solid #D32F2F` 
                  : ticket.status === 'open' 
                    ? `1px solid #FF9800` 
                    : '1px solid #f0f0f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {ticket.subject}
                    {ticket.priority === 'critical' && (
                      <span style={{
                        background: '#D32F2F',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>
                        فوری
                      </span>
                    )}
                  </h3>
                  <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>
                    {ticket.message && ticket.message.length > 100 
                      ? ticket.message.substring(0, 100) + '...' 
                      : ticket.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    <span style={{ fontSize: '11px', color: colors.textSecondary }}>
                      {formatDate(ticket.createdAt)}
                    </span>
                    {ticket.user && (
                      <span style={{ fontSize: '11px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HiOutlineUser size={12} />
                        {ticket.user.firstName} {ticket.user.lastName}
                        {ticket.user.role && (
                          <span style={{
                            background: '#E0E0E0',
                            color: '#666',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            fontSize: '9px'
                          }}>
                            {ticket.user.role === 'student' ? 'دانش‌آموز' : 
                             ticket.user.role === 'teacher' ? 'معلم' : 
                             ticket.user.role === 'school_admin' ? 'مدیر مدرسه' : 
                             ticket.user.role === 'parent' ? 'والدین' : 
                             ticket.user.role}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isAdmin && (
                    <select
                      value={ticket.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(ticket.id, e.target.value);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.primary}`,
                        fontSize: '11px',
                        background: 'white'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="open">باز</option>
                      <option value="answered">پاسخ داده شده</option>
                      <option value="closed">بسته</option>
                    </select>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTicket(ticket);
                    }}
                    style={{
                      background: `${colors.primary}15`,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      color: colors.primary,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <HiOutlineChat size={16} />
                    {ticket.replies?.length > 0 && (
                      <span style={{
                        background: colors.primary,
                        color: 'white',
                        borderRadius: '50%',
                        padding: '0px 6px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {ticket.replies.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal New Ticket */}
      {showNewTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setShowNewTicket(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>تیکت جدید</h3>
            
            <input
              type="text"
              placeholder="موضوع *"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.primary}`,
                borderRadius: '12px',
                marginBottom: '12px',
                fontSize: '14px'
              }}
            />
            
            <textarea
              placeholder="متن تیکت *"
              value={newTicket.message}
              onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.primary}`,
                borderRadius: '12px',
                marginBottom: '12px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            
            <select
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.primary}`,
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '14px'
              }}
            >
              <option value="low">اولویت: کم</option>
              <option value="medium">اولویت: متوسط</option>
              <option value="high">اولویت: بالا</option>
              <option value="critical">اولویت: فوری</option>
            </select>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowNewTicket(false)}
                disabled={updating}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#E0E0E0',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                انصراف
              </button>
              <button
                onClick={handleSubmitTicket}
                disabled={updating}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: colors.primary,
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: updating ? 0.6 : 1
                }}
              >
                {updating ? 'در حال ارسال...' : 'ارسال'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ticket Detail */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setSelectedTicket(null)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedTicket.subject}</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                  {formatDate(selectedTicket.createdAt)}
                </span>
                {selectedTicket.user && (
                  <span style={{ fontSize: '12px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HiOutlineUser size={14} />
                    {selectedTicket.user.firstName} {selectedTicket.user.lastName}
                    <span style={{
                      background: '#E0E0E0',
                      color: '#666',
                      padding: '1px 8px',
                      borderRadius: '8px',
                      fontSize: '10px'
                    }}>
                      {selectedTicket.user.role === 'student' ? 'دانش‌آموز' : 
                       selectedTicket.user.role === 'teacher' ? 'معلم' : 
                       selectedTicket.user.role === 'school_admin' ? 'مدیر مدرسه' : 
                       selectedTicket.user.role === 'parent' ? 'والدین' : 
                       selectedTicket.user.role}
                    </span>
                  </span>
                )}
              </div>
              <p style={{ fontSize: '14px', color: colors.text, lineHeight: 1.8 }}>
                {selectedTicket.message}
              </p>
            </div>

            {/* نمایش پاسخ‌ها */}
            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
              <div style={{ marginBottom: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>
                  پاسخ‌ها ({selectedTicket.replies.length})
                </h4>
                {selectedTicket.replies.map((reply, index) => (
                  <div key={index} style={{
                    background: colors.bg,
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: colors.primary }}>
                        {reply.user?.firstName} {reply.user?.lastName}
                        {reply.user?.role === 'team_admin' && ' (ادمین)'}
                      </span>
                      <span style={{ fontSize: '10px', color: colors.textSecondary }}>
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: colors.text, lineHeight: 1.6 }}>
                      {reply.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Section */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                {isAdmin ? 'پاسخ به تیکت' : 'ارسال پاسخ'}
              </h4>
              <textarea
                placeholder="متن پاسخ خود را وارد کنید..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.primary}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              
              {isAdmin && (
                <div style={{ marginTop: '12px' }}>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      handleStatusChange(selectedTicket.id, e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${colors.primary}`,
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="open">باز</option>
                    <option value="answered">پاسخ داده شده</option>
                    <option value="closed">بسته</option>
                  </select>
                </div>
              )}
              
              <button
                onClick={handleReply}
                disabled={updating}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '12px',
                  background: colors.primary,
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: updating ? 0.6 : 1
                }}
              >
                {updating ? 'در حال ارسال...' : 'ارسال پاسخ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;