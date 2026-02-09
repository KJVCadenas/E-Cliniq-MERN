import { User, History, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { formatDate } from '@/lib/formatters';

export default function PastAppointment() {
  return (
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
                      <p className="text-sm text-foreground/70">{app.notes}</p>
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
  );
}
