'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { sanitizeFormData } from '@/lib/sanitizer';

// ------------------------------
// Schema & Types (Zod v4 friendly)
// ------------------------------
const appointmentSchema = z.object({
  doctor: z.string().min(1, { message: 'Please select a doctor' }),

  date: z.preprocess(
    input => {
      if (input instanceof Date) {
        return isNaN(input.getTime()) ? input : input;
      }
      if (typeof input === 'string' && input.trim().length > 0) {
        const parsed = new Date(input);
        return isNaN(parsed.getTime()) ? input : parsed;
      }
      return input;
    },
    z
      .date({
        error: issue =>
          issue.input === undefined
            ? 'Please select a date'
            : 'Invalid calendar date',
      })
      .min(new Date(), { message: 'Please select a future date' })
  ),

  time: z.string().min(1, { message: 'Please select a time' }),

  reason: z.string().min(10, {
    message: 'Please provide a reason (minimum 10 characters)',
  }),
});

type AppointmentInput = z.input<typeof appointmentSchema>;
type AppointmentOutput = z.output<typeof appointmentSchema>;

// ------------------------------
// Mock Data
// ------------------------------
const availableDoctors = [
  { id: '1', name: 'Dr. Sarah Johnson' },
  { id: '2', name: 'Dr. Michael Chen' },
];

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

// ------------------------------
// Helper Functions
// ------------------------------
const safeDate = (value: unknown): Date | null => {
  if (!value) return null;
  try {
    // Handle different input types
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    // For other types, try to convert to string first
    const date = new Date(value.toString());
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// ------------------------------
// Component
// ------------------------------
interface RequestAppointmentFormProps {
  onSuccess: () => void;
}

export default function RequestAppointmentForm({
  onSuccess,
}: RequestAppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentInput, unknown, AppointmentOutput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctor: '',
      time: '',
      reason: '',
      date: undefined,
    },
  });

  const onSubmit = async (data: AppointmentOutput) => {
    setIsSubmitting(true);
    const sanitizedData = sanitizeFormData(data);
    await new Promise(r => setTimeout(r, 2000));
    console.log('Appointment data:', sanitizedData);
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-xl w-full mx-auto"
      >
        {/* Doctor */}
        <FormField
          control={form.control}
          name="doctor"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Doctor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDoctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl className="w-full">
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-10 pl-3 text-left font-normal',
                          !field.value ? 'text-muted-foreground' : '',
                          'hover:bg-accent/5'
                        )}
                      >
                        {safeDate(field.value) ? (
                          format(safeDate(field.value)!, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={safeDate(field.value) || undefined}
                      onSelect={date => field.onChange(date)}
                      disabled={date =>
                        date < new Date() || date < new Date('1900-01-01')
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl className="w-full">
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map(ts => (
                      <SelectItem key={ts} value={ts}>
                        {ts}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Reason for Visit</FormLabel>
              <FormControl className="w-full">
                <Textarea
                  placeholder="Describe your symptoms or reason..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking
              Appointment...
            </>
          ) : (
            'Book Appointment'
          )}
        </Button>
      </form>
    </Form>
  );
}
