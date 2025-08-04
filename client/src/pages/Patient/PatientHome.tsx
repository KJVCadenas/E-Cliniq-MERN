import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  User,
  History,
  Loader2,
} from 'lucide-react';
import BookAppointmentForm from '../../components/BookAppointmentForm';
import { toast } from 'sonner';
import clsx from 'clsx';

// Types
interface Doctor {
  id: string;
  name: string;
  avatar?: string;
}

interface Appointment {
  id: string;
  doctor: Doctor;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
}

// Mock data
const mockCurrentAppointments: Appointment[] = [
  {
    id: '1',
    doctor: { id: '1', name: 'Dr. Sarah Johnson' },
    date: '2024-01-29',
    time: '14:30',
    location: 'Building A, Room 205',
    status: 'confirmed',
  },
  //   {
  //     id: '2',
  //     doctor: { id: '2', name: 'Dr. Michael Chen' },
  //     date: '2024-01-29',
  //     time: '16:00',
  //     location: 'Building B, Room 102',
  //     status: 'confirmed',
  //   },
];

const mockUpcomingAppointments: Appointment[] = [
  {
    id: '3',
    doctor: { id: '3', name: 'Dr. Emily Rodriguez' },
    date: '2024-02-01',
    time: '09:00',
    location: 'Building C, Room 301',
    status: 'confirmed',
  },
  {
    id: '4',
    doctor: { id: '4', name: 'Dr. James Wilson' },
    date: '2024-02-03',
    time: '11:30',
    location: 'Building A, Room 405',
    status: 'pending',
  },
  //   {
  //     id: '5',
  //     doctor: { id: '5', name: 'Dr. Lisa Thompson' },
  //     date: '2024-02-05',
  //     time: '15:00',
  //     location: 'Building B, Room 201',
  //     status: 'confirmed',
  //   },
];

const mockPastAppointments: Appointment[] = [
  {
    id: 'past1',
    doctor: { id: '1', name: 'Dr. Sarah Johnson' },
    date: '2024-01-15',
    time: '14:30',
    location: 'Building A, Room 205',
    status: 'completed',
    notes:
      'Regular checkup completed. Blood pressure normal. Next appointment in 6 months.',
  },
  {
    id: 'past2',
    doctor: { id: '2', name: 'Dr. Michael Chen' },
    date: '2024-01-10',
    time: '10:00',
    location: 'Building B, Room 102',
    status: 'completed',
    notes:
      'Skin examination completed. Prescribed topical treatment for minor irritation.',
  },
  {
    id: 'past3',
    doctor: { id: '1', name: 'Dr. Sarah Johnson' },
    date: '2023-12-20',
    time: '16:00',
    location: 'Building A, Room 205',
    status: 'cancelled',
    notes:
      'Follow-up appointment. EKG results normal. Continue current medication.',
  },
];

// Fetch mocks
const fetchCurrentAppointments = (): Promise<Appointment[]> => {
  return new Promise(resolve =>
    setTimeout(() => resolve(mockCurrentAppointments), 1000)
  );
};

const fetchUpcomingAppointments = (): Promise<Appointment[]> => {
  return new Promise(resolve =>
    setTimeout(() => resolve(mockUpcomingAppointments), 1200)
  );
};

const fetchPastAppointments = (): Promise<Appointment[]> => {
  return new Promise(resolve =>
    setTimeout(() => resolve(mockPastAppointments), 800)
  );
};

// Helpers
const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'confirmed':
      return 'w-[100px] bg-green-500/10 border-green-500 text-green-500';
    case 'pending':
      return 'w-[100px] bg-amber-100 border-amber-500 text-amber-500';
    case 'cancelled':
      return 'w-[100px] bg-red-500/10 border-red-500 text-red-500';
    case 'completed':
      return 'w-[100px] bg-green-500/10 border-green-500 text-green-500';
    default:
      return 'w-[100px] bg-gray-500 border-gray-500 text-gray-500';
  }
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

export default function PatientHomePage() {
  const [currentAppointments, setCurrentAppointments] = useState<Appointment[]>(
    []
  );
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCurrentAppointments().then(data => {
      setCurrentAppointments(data);
      setIsLoadingCurrent(false);
    });
    fetchUpcomingAppointments().then(data => {
      setUpcomingAppointments(data);
      setIsLoadingUpcoming(false);
    });
    fetchPastAppointments().then(data => {
      setPastAppointments(data);
      setIsLoadingPast(false);
    });
  }, [mockCurrentAppointments, mockPastAppointments, mockUpcomingAppointments]);

  const handleAppointmentBooked = () => {
    setIsDialogOpen(false);
    toast.success('Appointment Booked!', {
      description: 'Your appointment has been successfully scheduled.',
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Patient Dashboard Header */}
      <header className="bg-white text-clinic-dark-secondary rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-clinic-dark-secondary p-3 rounded-full">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl italic md:text-3xl font-bold">
                  Hi, John Doe!
                </h1>
                <div className="mt-2">
                  <p className="text-clinic-dark-secondary">
                    <span className="font-semibold">Student ID:</span>{' '}
                    2020-140189
                  </p>
                  <p className="text-clinic-dark-secondary">
                    <span className="font-semibold">Course/Section:</span>{' '}
                    BSCS-SS201
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Button className="bg-clinic-dark-secondary text-white hover:bg-clinic-dark-secondary/90 font-semibold rounded-lg px-4 py-2 h-auto transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/50">
                Update Patient Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Today's Appointments */}
      <section
        role="region"
        aria-label="Today's Appointments"
        className="rounded-2xl border border-l-8 border-primary bg-background p-6"
      >
        <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          Today's Appointments
        </h2>

        {isLoadingCurrent ? (
          <div role="status" className="flex justify-center py-16">
            <Loader2
              className="animate-spin h-8 w-8 text-foreground/70"
              aria-hidden
            />
            <span className="sr-only">Loading today's appointments...</span>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex flex-col sm:flex-row sm:gap-4 gap-6">
              {currentAppointments.length > 0 ? (
                currentAppointments.map(app => (
                  <Card
                    key={app.id}
                    className="rounded-2xl shadow-sm border-primary hover:shadow-md transition-shadow flex-1"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {app.doctor.name}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={clsx(
                            'capitalize',
                            getStatusColor(app.status)
                          )}
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-foreground/70">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{app.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{app.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="w-full border-primary text-center py-12">
                  <CardContent>
                    <p className="font-semibold">
                      No appointments scheduled for today
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      Check back later or book a new appointment.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </section>

      {/* Upcoming Appointments */}
      <section
        role="region"
        aria-label="Upcoming Appointments"
        className="rounded-2xl bg-background p-6 border border-l-8 border-accent"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-clinic-yellow flex items-center gap-2">
            <Calendar className="h-5 w-5 text-clinic-yellow" />
            Upcoming Appointments
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-clinic-yellow text-black hover:bg-clinic-yellow/50 font-semibold rounded-lg px-5 py-2 focus-visible:ring focus-visible:ring-accent/50 focus:outline-none">
                <Plus className="h-4 w-4 mr-2" />
                Request Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  Request a Doctor's Appointment
                </DialogTitle>
              </DialogHeader>
              <BookAppointmentForm onSuccess={handleAppointmentBooked} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingUpcoming ? (
          <div role="status" className="flex justify-center py-16">
            <Loader2
              className="animate-spin h-8 w-8 text-foreground/70"
              aria-hidden
            />
            <span className="sr-only">Loading upcoming appointments...</span>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex flex-col sm:flex-row sm:gap-4 gap-6">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(app => (
                  <Card
                    key={app.id}
                    className="rounded-2xl shadow-sm border-accent hover:shadow-md transition-shadow flex-1"
                  >
                    <CardContent className="pt-0 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <CardTitle className="text-lg font-bold text-foreground">
                          {app.doctor.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={clsx(
                            'capitalize',
                            getStatusColor(app.status)
                          )}
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-foreground/70">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(app.date)} at {app.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{app.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="w-full text-center py-12">
                  <CardContent>
                    <p className="font-semibold">No upcoming appointments</p>
                    <p className="mt-2 text-sm text-foreground">
                      Book your next visit to stay healthy!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </section>

      {/* Past Appointments */}
      <section
        role="region"
        aria-label="Past Appointments"
        className="rounded-2xl bg-background p-6 border border-l-8 border-clinic-dark-secondary"
      >
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-foreground" />
          Past Appointments
        </h2>

        {isLoadingPast ? (
          <div role="status" className="flex justify-center py-16">
            <Loader2
              className="animate-spin h-8 w-8 text-foreground/70"
              aria-hidden
            />
            <span className="sr-only">Loading past appointments...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(app => (
                <Card
                  key={app.id}
                  className="rounded-2xl border border-clinic-dark-secondary hover:bg-muted/20 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {app.doctor.name}
                          </h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground/70">
                          {formatDate(app.date)}
                        </p>
                        <Badge
                          variant="outline"
                          className={clsx(
                            'text-xs',
                            'capitalize',
                            getStatusColor(app.status)
                          )}
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                    {app.notes && (
                      <div className="mt-3 pt-3 border-t border-clinic-dark-secondary/25">
                        <p className="text-sm text-foreground/70">
                          {app.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-foreground/70">No past appointments</p>
                  <p className="mt-2 text-sm text-foreground/70">
                    Everything starts with good health—book again soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
