import React, { useState } from "react";
import { 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  DollarSign, 
  FileCheck, 
  Home,
  ArrowRight,
  Upload,
  Search,
  Calendar,
  MapPin,
  Clock,
  Info,
  FileUp,
  Check,
  X,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProcessStage {
  id: number;
  title: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'pending' | 'failed';
}

interface ReservationDetails {
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  dormitoryName: string;
  totalAmount: string;
}

interface ProcessFlowProps {
  booking?: any;
  cartItem?: any;
}

const ProcessFlow: React.FC<ProcessFlowProps> = ({ booking, cartItem }) => {
  const [activeStep, setActiveStep] = useState(1);
  // Use booking data or fallback to mock data
  const reservationDetails: ReservationDetails = {
    roomNumber: cartItem?.roomNumber || "A-205",
    roomType: cartItem?.title || "Single Room with Private Bathroom",
    checkIn: cartItem?.checkIn || "2024-09-01",
    checkOut: cartItem?.checkOut || "2024-06-30",
    dormitoryName: cartItem?.location || "Istanbul Modern Residence",
    totalAmount: booking ? `$${booking.total_amount}` : "$4,800"
  };

  // Current substages status - use booking data or defaults
  const documentStatus = "Not Uploaded Yet"; // Options: Not Uploaded Yet, Uploaded / Under Review, Incomplete / Missing Files, Invalid Files, Complete / Accepted
  const paymentStatus = booking?.payment_status === 'paid' ? 'Paid Successfully' : 
                       booking?.payment_status === 'pending' ? 'Payment Under Review' : 'Not Paid';
  const bookingStatus = booking?.booking_status === 'confirmed' ? 'Booking Confirmed / Successful' :
                       booking?.booking_status === 'pending' ? 'Booking Under Review' : 'Booking Under Review';

  // Main stages based on booking data
  const stages: ProcessStage[] = [
    {
      id: 1,
      title: "Select Room",
      icon: Home,
      status: "completed" // Always completed if booking exists
    },
    {
      id: 2, 
      title: "Upload Documents",
      icon: Upload,
      status: 'current' // Default to current for document upload stage
    },
    {
      id: 3,
      title: "Payment", 
      icon: CreditCard,
      status: booking?.payment_status === 'paid' ? 'completed' :
              booking?.payment_status === 'pending' ? 'current' : 'pending'
    },
    {
      id: 4,
      title: "Final Booking Status",
      icon: CheckCircle, 
      status: booking?.booking_status === 'confirmed' ? 'completed' :
              booking?.booking_status === 'pending' ? 'current' : 'pending'
    }
  ];

  const getStageShape = (stage: ProcessStage, index: number) => {
    const isCompleted = stage.status === 'completed';
    const isCurrent = stage.status === 'current';
    const isPending = stage.status === 'pending';
    const isActive = activeStep === stage.id;
    
    return (
      <Card 
        className={cn(
          "relative p-4 min-w-[180px] transition-all cursor-pointer hover:shadow-lg transform hover:scale-105",
          isCompleted && "bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-green-100",
          isCurrent && "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-blue-100",
          isPending && "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200",
          isActive && "ring-2 ring-primary ring-offset-2 shadow-xl"
        )}
        onClick={() => setActiveStep(stage.id)}
      >
        <CardContent className="p-0 flex flex-col items-center text-center">
          <div className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center border-3 mb-4 transition-all shadow-lg",
            isCompleted && "bg-gradient-to-br from-green-100 to-green-200 border-green-500 text-green-700",
            isCurrent && "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-500 text-blue-700",
            isPending && "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-500"
          )}>
            {isCompleted && (
              <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-white bg-green-600 rounded-full p-1" />
            )}
            <stage.icon className="w-8 h-8" />
          </div>
          
          <div className="text-center">
            <div className="text-sm font-bold mb-2 text-primary">
              Step {index + 1}
            </div>
            <div className="text-sm leading-tight font-semibold mb-3">
              {stage.title}
            </div>
            <Badge 
              variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"} 
              className={cn(
                "text-xs font-medium px-3 py-1",
                isCompleted && "bg-green-500 text-white hover:bg-green-600",
                isCurrent && "bg-blue-500 text-white hover:bg-blue-600",
                isPending && "bg-gray-400 text-white hover:bg-gray-500"
              )}
            >
              {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete / accepted':
      case 'paid successfully':
      case 'booking confirmed / successful':
        return { variant: 'success', icon: CheckCircle };
      case 'uploaded / under review':
      case 'payment under review':
      case 'booking under review':
        return { variant: 'warning', icon: Clock };
      case 'incomplete / missing files':
      case 'invalid files':
      case 'payment failed':
      case 'booking rejected':
        return { variant: 'error', icon: AlertCircle };
      default:
        return { variant: 'neutral', icon: AlertCircle };
    }
  };

  const renderStepContent = () => {
    const currentStage = stages.find(s => s.id === activeStep);
    if (!currentStage) return null;

    switch (activeStep) {
      case 1: // Select Room
        return (
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Home className="w-5 h-5" />
                Room Selection Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Room Details:</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{reservationDetails.roomNumber} - {reservationDetails.roomType}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Location:</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{reservationDetails.dormitoryName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Duration:</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{reservationDetails.checkIn} to {reservationDetails.checkOut}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Total Cost:</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{reservationDetails.totalAmount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Room successfully selected and reserved</span>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Upload Documents
        return (
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Upload className="w-5 h-5" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Passport Copy</p>
                      <p className="text-xs text-muted-foreground">Required for identity verification</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    Not Uploaded
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">University Acceptance Letter</p>
                      <p className="text-xs text-muted-foreground">Proof of enrollment</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    Not Uploaded
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Financial Statement</p>
                      <p className="text-xs text-muted-foreground">Bank statement or sponsor letter</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    Not Uploaded
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Please upload all required documents to proceed</span>
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <FileUp className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        );

      case 3: // Payment
        return (
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <CreditCard className="w-5 h-5" />
                Payment Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Total Amount:</span>
                  <p className="text-2xl font-bold text-purple-800">{reservationDetails.totalAmount}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Payment Method:</span>
                  <p className="text-sm text-muted-foreground">{booking?.payment_method || 'Credit Card'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Room Rent</p>
                      <p className="text-xs text-muted-foreground">Monthly payment</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    ${Math.round(Number(booking?.total_amount || 4800) * 0.8)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Security Deposit</p>
                      <p className="text-xs text-muted-foreground">Refundable</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    ${Math.round(Number(booking?.total_amount || 4800) * 0.2)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {paymentStatus}. We'll notify you once payment is confirmed.
                </span>
              </div>
            </CardContent>
          </Card>
        );

      case 4: // Final Booking Status
        return (
          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <CheckCircle className="w-5 h-5" />
                Final Booking Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-sm">Application Review</p>
                      <p className="text-xs text-muted-foreground">Documents and payment verification</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Under Review
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-sm">Room Assignment</p>
                      <p className="text-xs text-muted-foreground">Final room confirmation</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    Pending
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-sm">Booking Confirmation</p>
                      <p className="text-xs text-muted-foreground">Final confirmation email</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    Pending
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-indigo-100 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">
                  Your application is being reviewed. You'll receive an update within 2-3 business days.
                </span>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                📍 Interactive Process Flow
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click on any step to view detailed information and current status
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round((stages.filter(s => s.status === 'completed').length / stages.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress 
              value={(stages.filter(s => s.status === 'completed').length / stages.length) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Interactive Steps */}
      <div className="flex items-stretch justify-between gap-4 overflow-x-auto pb-4">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            {getStageShape(stage, index)}
            
            {/* Arrow between stages */}
            {index < stages.length - 1 && (
              <div className="flex items-center px-2 self-center">
                <ArrowRight className="w-6 h-6 text-muted-foreground opacity-60" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="transition-all duration-300">
        {renderStepContent()}
      </div>

      {/* Quick Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Documents</span>
              </div>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {documentStatus}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Payment</span>
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  paymentStatus === 'Paid Successfully' ? "bg-green-100 text-green-800" :
                  paymentStatus === 'Payment Under Review' ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-700"
                )}
              >
                {paymentStatus}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Booking</span>
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  bookingStatus === 'Booking Confirmed / Successful' ? "bg-green-100 text-green-800" :
                  "bg-yellow-100 text-yellow-800"
                )}
              >
                {bookingStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessFlow;