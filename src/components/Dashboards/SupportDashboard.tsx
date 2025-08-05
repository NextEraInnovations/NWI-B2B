import React, { useState } from 'react';
import { 
  MessageSquare, 
  Truck, 
  ShoppingCart, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  User,
  Phone,
  Mail,
  Calendar,
  Filter,
  Search,
  DollarSign,
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupportTicket, ReturnRequest, Order } from '../../types';

interface SupportDashboardProps {
  activeTab: string;
}

export function SupportDashboard({ activeTab }: SupportDashboardProps) {
  const { state, dispatch } = useApp();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [returnFilter, setReturnFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = state.tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = ticketFilter === 'all' || ticket.status === ticketFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredReturns = state.returnRequests.filter(returnReq => {
    const matchesFilter = returnFilter === 'all' || returnReq.status === returnFilter;
    return matchesFilter;
  });

  const handleUpdateTicket = (ticketId: string, status: SupportTicket['status'], assignedTo?: string) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (ticket) {
      dispatch({ 
        type: 'UPDATE_TICKET', 
        payload: { 
          ...ticket, 
          status, 
          assignedTo,
          updatedAt: new Date().toISOString() 
        }
      });
    }
  };

  const handleApproveReturn = (returnId: string, approvedAmount: number, refundMethod: string) => {
    dispatch({
      type: 'APPROVE_RETURN_REQUEST',
      payload: {
        id: returnId,
        supportId: state.currentUser!.id,
        approvedAmount,
        refundMethod
      }
    });
  };

  const handleRejectReturn = (returnId: string, reason: string) => {
    dispatch({
      type: 'REJECT_RETURN_REQUEST',
      payload: {
        id: returnId,
        supportId: state.currentUser!.id,
        reason
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Support Dashboard</h2>
        <div className="text-sm text-gray-500">
          Customer support overview
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{state.tickets.filter(t => t.status === 'open').length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <MessageSquare className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{state.tickets.filter(t => t.status === 'in_progress').length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Return Requests</p>
              <p className="text-3xl font-bold text-gray-900">{state.returnRequests.filter(r => r.status === 'pending').length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Issues</p>
              <p className="text-3xl font-bold text-gray-900">{state.tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Tickets</h3>
          <div className="space-y-3">
            {state.tickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    ticket.priority === 'urgent' ? 'bg-red-500' :
                    ticket.priority === 'high' ? 'bg-orange-500' :
                    ticket.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{ticket.subject}</p>
                    <p className="text-sm text-gray-500">{ticket.userName}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Returns</h3>
          <div className="space-y-3">
            {state.returnRequests.slice(0, 5).map((returnReq) => (
              <div key={returnReq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    returnReq.priority === 'urgent' ? 'bg-red-500' :
                    returnReq.priority === 'high' ? 'bg-orange-500' :
                    returnReq.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{returnReq.orderId}</p>
                    <p className="text-sm text-gray-500">R{returnReq.requestedAmount.toLocaleString()}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnReq.status)}`}>
                  {getStatusIcon(returnReq.status)}
                  {returnReq.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Support Tickets</h2>
        <div className="text-sm text-gray-500">
          {filteredTickets.length} tickets
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{ticket.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">User:</span>
                    <span className="ml-2 font-medium">{ticket.userName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.assignedTo && (
                    <div>
                      <span className="text-gray-500">Assigned:</span>
                      <span className="ml-2 font-medium">Support Agent</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {ticket.status === 'open' && (
                  <button
                    onClick={() => handleUpdateTicket(ticket.id, 'in_progress', state.currentUser!.id)}
                    className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
                  >
                    Take Ticket
                  </button>
                )}
                {ticket.status === 'in_progress' && (
                  <button
                    onClick={() => handleUpdateTicket(ticket.id, 'resolved')}
                    className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
                  >
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ticket Details</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2">{selectedTicket.subject}</h4>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)}
                    {selectedTicket.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{selectedTicket.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Ticket Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">ID:</span>
                      <span className="font-medium text-xs sm:text-sm">#{selectedTicket.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Priority:</span>
                      <span className={`font-medium capitalize ${
                        selectedTicket.priority === 'urgent' ? 'text-red-600' :
                        selectedTicket.priority === 'high' ? 'text-orange-600' :
                        selectedTicket.priority === 'medium' ? 'text-yellow-600' :
                        'text-gray-600'
                      } text-xs sm:text-sm`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Created:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Updated:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedTicket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">User Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Name:</span>
                      <span className="font-medium text-xs sm:text-sm">{selectedTicket.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">User ID:</span>
                      <span className="font-medium text-xs sm:text-sm">#{selectedTicket.userId}</span>
                    </div>
                    {selectedTicket.assignedTo && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs sm:text-sm">Assigned To:</span>
                        <span className="font-medium text-xs sm:text-sm">Support Agent</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {selectedTicket.status === 'open' && (
                  <button
                    onClick={() => {
                      handleUpdateTicket(selectedTicket.id, 'in_progress', state.currentUser!.id);
                      setSelectedTicket(null);
                    }}
                    className="flex-1 bg-yellow-50 text-yellow-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-yellow-100 transition-colors font-medium text-sm sm:text-base"
                  >
                    Take Ticket
                  </button>
                )}
                {selectedTicket.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      handleUpdateTicket(selectedTicket.id, 'resolved');
                      setSelectedTicket(null);
                    }}
                    className="flex-1 bg-green-50 text-green-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-green-100 transition-colors font-medium text-sm sm:text-base"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 bg-gray-50 text-gray-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReturns = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Return Requests</h2>
        <div className="flex items-center gap-4">
          <select
            value={returnFilter}
            onChange={(e) => setReturnFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
          <div className="text-sm text-gray-500">
            {filteredReturns.length} requests
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReturns.map((returnReq) => (
          <div key={returnReq.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Return Request #{returnReq.id}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnReq.status)}`}>
                    {getStatusIcon(returnReq.status)}
                    {returnReq.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(returnReq.priority)}`}>
                    {returnReq.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{returnReq.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Order:</span>
                    <span className="ml-2 font-medium">#{returnReq.orderId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-bold text-red-600">R{returnReq.requestedAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Items:</span>
                    <span className="ml-2 font-medium">{returnReq.items.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium">{new Date(returnReq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {returnReq.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        const amount = prompt('Approved refund amount:', returnReq.requestedAmount.toString());
                        const method = prompt('Refund method (original_payment/store_credit/bank_transfer):', 'original_payment');
                        if (amount && method) {
                          handleApproveReturn(returnReq.id, Number(amount), method);
                        }
                      }}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) {
                          handleRejectReturn(returnReq.id, reason);
                        }
                      }}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedReturn(returnReq)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Return Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Return Request #{selectedReturn.id}</h3>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReturn.status)}`}>
                        {getStatusIcon(selectedReturn.status)}
                        {selectedReturn.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Order ID:</span>
                      <span className="font-medium text-xs sm:text-sm">#{selectedReturn.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Reason:</span>
                      <span className="font-medium capitalize text-xs sm:text-sm">{selectedReturn.reason.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Priority:</span>
                      <span className={`font-medium capitalize ${
                        selectedReturn.priority === 'urgent' ? 'text-red-600' :
                        selectedReturn.priority === 'high' ? 'text-orange-600' :
                        selectedReturn.priority === 'medium' ? 'text-yellow-600' :
                        'text-gray-600'
                      } text-xs sm:text-sm`}>
                        {selectedReturn.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Requested Amount:</span>
                      <span className="font-bold text-red-600 text-sm sm:text-base">R{selectedReturn.requestedAmount.toLocaleString()}</span>
                    </div>
                    {selectedReturn.approvedAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs sm:text-sm">Approved Amount:</span>
                        <span className="font-bold text-green-600 text-sm sm:text-base">R{selectedReturn.approvedAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Processing Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Created:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedReturn.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Updated:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedReturn.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {selectedReturn.processedBy && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs sm:text-sm">Processed By:</span>
                        <span className="font-medium text-xs sm:text-sm">Support Agent</span>
                      </div>
                    )}
                    {selectedReturn.refundMethod && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs sm:text-sm">Refund Method:</span>
                        <span className="font-medium capitalize text-xs sm:text-sm">{selectedReturn.refundMethod.replace('_', ' ')}</span>
                      </div>
                    )}
                    {selectedReturn.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs sm:text-sm">Tracking:</span>
                        <span className="font-medium text-xs sm:text-sm">{selectedReturn.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Description</h4>
                <p className="text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">{selectedReturn.description}</p>
              </div>

              {selectedReturn.rejectionReason && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Rejection Reason</h4>
                  <p className="text-red-600 bg-red-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">{selectedReturn.rejectionReason}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Return Items</h4>
                <div className="space-y-3">
                  {selectedReturn.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">{item.productName}</h5>
                        <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Reason: {item.reason}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Condition: {item.condition.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">R{item.totalRefund.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-500">R{item.unitPrice} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      const amount = prompt('Approved refund amount:', selectedReturn.requestedAmount.toString());
                      const method = prompt('Refund method (original_payment/store_credit/bank_transfer):', 'original_payment');
                      if (amount && method) {
                        handleApproveReturn(selectedReturn.id, Number(amount), method);
                        setSelectedReturn(null);
                      }
                    }}
                    className="flex-1 bg-green-50 text-green-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-green-100 transition-colors font-medium text-sm sm:text-base"
                  >
                    Approve Return
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) {
                        handleRejectReturn(selectedReturn.id, reason);
                        setSelectedReturn(null);
                      }
                    }}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-red-100 transition-colors font-medium text-sm sm:text-base"
                  >
                    Reject Return
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Order Issues</h2>
        <div className="text-sm text-gray-500">
          Orders requiring support attention
        </div>
      </div>

      <div className="space-y-4">
        {state.orders.filter(order => order.status === 'cancelled' || order.paymentStatus === 'failed').map((order) => (
          <div key={order.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-2 font-bold text-green-600">R{order.total.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Items:</span>
                    <span className="ml-2 font-medium">{order.items.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Date:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Total:</span>
                      <span className="font-bold text-green-600 text-sm sm:text-base">R{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Payment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">{item.productName}</h5>
                        <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">R{item.total.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-500">R{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">User Support</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Users:</span>
              <span className="font-bold text-gray-900">{state.users.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Wholesalers:</span>
              <span className="font-bold text-green-600">{state.users.filter(u => u.role === 'wholesaler').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Retailers:</span>
              <span className="font-bold text-orange-600">{state.users.filter(u => u.role === 'retailer').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verified Users:</span>
              <span className="font-bold text-blue-600">{state.users.filter(u => u.verified).length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Support Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Open Tickets:</span>
              <span className="font-bold text-red-600">{state.tickets.filter(t => t.status === 'open').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-bold text-yellow-600">{state.tickets.filter(t => t.status === 'in_progress').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Resolved Today:</span>
              <span className="font-bold text-green-600">{state.tickets.filter(t => t.status === 'resolved').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Returns:</span>
              <span className="font-bold text-blue-600">{state.returnRequests.filter(r => r.status === 'pending').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent User Activity</h3>
        <div className="space-y-3">
          {state.users.slice(0, 10).map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'wholesaler' ? 'bg-green-100 text-green-800' :
                  user.role === 'retailer' ? 'bg-orange-100 text-orange-800' :
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
                {user.verified && (
                  <div className="text-xs text-green-600 mt-1">Verified</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'overview':
      return renderOverview();
    case 'tickets':
      return renderTickets();
    case 'returns':
      return renderReturns();
    case 'orders':
      return renderOrders();
    case 'users':
      return renderUsers();
    default:
      return renderOverview();
  }
}