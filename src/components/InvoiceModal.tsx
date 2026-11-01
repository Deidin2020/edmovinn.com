import React from "react";
import { X, Printer, Download, Calendar, MapPin, DollarSign, User, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, booking }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a new window with the invoice content for printing/PDF
    const printWindow = window.open('', '_blank');
    const invoiceContent = document.getElementById('invoice-content')?.innerHTML;
    
    if (printWindow && invoiceContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${booking?.id?.slice(0, 8)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .invoice-header { text-align: center; margin-bottom: 30px; }
              .invoice-details { margin: 20px 0; }
              .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              .invoice-table th { background-color: #f5f5f5; }
              .total-section { margin-top: 20px; text-align: right; }
              .footer { margin-top: 40px; text-align: center; color: #666; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            ${invoiceContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!booking) return null;

  const invoiceDate = new Date(booking.created_at).toLocaleDateString();
  const invoiceNumber = `INV-${booking.id.slice(0, 8).toUpperCase()}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">Invoice Details</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div id="invoice-content" className="space-y-6">
          {/* Invoice Header */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">INVOICE</h1>
                  <div className="space-y-1 text-sm">
                    <p><strong>Invoice #:</strong> {invoiceNumber}</p>
                    <p><strong>Date:</strong> {invoiceDate}</p>
                    <p><strong>Status:</strong> 
                      <Badge 
                        className={`ml-2 ${
                          booking.payment_status === 'paid' ? 'bg-green-500' :
                          booking.payment_status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {booking.payment_status?.toUpperCase()}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold text-primary mb-2">MovInn Accommodation</h2>
                  <div className="text-sm text-muted-foreground">
                    <p>Istanbul, Turkey</p>
                    <p>info@movinn.com</p>
                    <p>+90 XXX XXX XXXX</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Booking Details */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Bill To
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>{booking.first_name} {booking.last_name}</strong></p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>{booking.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>{booking.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{booking.address}</span>
                  </div>
                  <p><strong>University:</strong> {booking.university_name}</p>
                  <p><strong>Nationality:</strong> {booking.nationality}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Booking Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Booking ID:</strong> {booking.id.slice(0, 8)}</p>
                  <p><strong>Booking Status:</strong> 
                    <Badge variant="secondary" className="ml-2">
                      {booking.booking_status}
                    </Badge>
                  </p>
                  <p><strong>Payment Method:</strong> {booking.payment_method}</p>
                  <p><strong>Emergency Contact:</strong> {booking.emergency_contact_name}</p>
                  <p><strong>Emergency Phone:</strong> {booking.emergency_contact_phone}</p>
                  <p><strong>Relation:</strong> {booking.emergency_contact_relation}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accommodation Items */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Accommodation Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Description</th>
                      <th className="text-center p-3 font-semibold">Quantity</th>
                      <th className="text-right p-3 font-semibold">Monthly Rate</th>
                      <th className="text-right p-3 font-semibold">Deposit</th>
                      <th className="text-right p-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(booking.cart_items) && booking.cart_items.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.location}</p>
                          </div>
                        </td>
                        <td className="text-center p-3">{item.quantity}</td>
                        <td className="text-right p-3">${item.price}</td>
                        <td className="text-right p-3">${item.deposit}</td>
                        <td className="text-right p-3 font-semibold">
                          ${(item.price + item.deposit) * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="bg-muted/20">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${(Number(booking.total_amount) * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee:</span>
                  <span>${(Number(booking.total_amount) * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Charge:</span>
                  <span>${(Number(booking.total_amount) * 0.10).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">${booking.total_amount}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Payment Status:</span>
                  <span className={`font-medium ${
                    booking.payment_status === 'paid' ? 'text-green-600' : 
                    booking.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Thank you for choosing MovInn Accommodation Services</p>
            <p>For any questions regarding this invoice, please contact us at support@movinn.com</p>
            <p className="mt-2">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;