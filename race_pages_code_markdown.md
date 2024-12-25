## RacePage.tsx

```tsx
import { useRoute } from "wouter";
import { useRaceDetails } from "@/hooks/useRaceDetails";
import { RaceHero } from "@/features/races/components/race/RaceHero";
import { WeatherCard } from "@/features/races/components/weather/WeatherCard";
import { CircuitGuide } from "@/features/races/components/circuit/CircuitGuide";
import { RaceSchedule } from "@/features/races/components/schedule/RaceSchedule";
import { RaceTickets } from "@/features/races/components/race/RaceTickets";
import { TravelGuide } from "@/features/races/components/travel/TravelGuide";
import { SimilarRaces } from "@/features/races/components/similar-races/SimilarRaces";
import { LoadingSpinner } from "@/components/ui/loading/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/error-message";

export default function RacePage() {
  const [, params] = useRoute("/race/:id");
  const raceId = params?.id ? parseInt(params.id, 10) : undefined;

  const { race, isLoading, error } = useRaceDetails(raceId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!race) {
    return <ErrorMessage message="Race not found" />;
  }

  const handleBookNow = () => {
    window.location.href = `/races/${race.id}/book`;
  };

  const handleRaceSelect = (selectedRace: typeof race) => {
    window.location.href = `/race/${selectedRace.id}`;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <RaceHero race={race} onBookNow={handleBookNow} />
      <div className="grid gap-8 md:grid-cols-2">
        <WeatherCard raceId={race.id} />
        <RaceSchedule schedule={race.schedule} />
      </div>
      <RaceTickets race={race} />
      <TravelGuide race={race} />
      <SimilarRaces races={[race]} onRaceSelect={handleRaceSelect} />
    </div>
  );
}

```

## RaceListPage.tsx

```tsx
import React from "react";
import { RaceListHeader } from "../features/races/components/list/RaceListHeader";
import { RaceGrid } from "../features/races/components/RaceGrid";
import { useRaceList } from "../hooks/useRaceList";
import { EmptyState } from "../components/ui/empty-state/EmptyState";
import { ErrorBoundary } from "react-error-boundary";
import { Loader2 } from "lucide-react";
import { ClientRace } from "@shared/types";

function LoadingState() {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}

function ErrorState({ error }: { error: Error }) {
    return (
        <EmptyState
            icon="error"
            title="Error loading races"
            description={error.message}
            action={{
                label: "Try Again",
                onClick: () => window.location.reload()
            }}
        />
    );
}

function RaceListContent() {
    const {
        races,
        isLoading,
        error,
        handleRaceClick,
        handleBackClick
    } = useRaceList();

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} />;
    }

    if (races.length === 0) {
        return (
            <EmptyState
                icon="search"
                title="No races found"
                description="There are no races available at the moment."
            />
        );
    }

    return (
        <>
            <RaceListHeader onBack={handleBackClick} />
            <RaceGrid
                races={races}
                onRaceClick={handleRaceClick}
            />
        </>
    );
}

function FallbackComponent({ error }: { error: Error }) {
    return (
        <EmptyState
            icon="error"
            title="Something went wrong"
            description={error.message}
            action={{
                label: "Try Again",
                onClick: () => window.location.reload()
            }}
        />
    );
}

export default function RaceListPage() {
    return (
        <div className="container py-8">
            <ErrorBoundary FallbackComponent={FallbackComponent}>
                <RaceListContent />
            </ErrorBoundary>
        </div>
    );
}
```

## RacesPage.tsx

```tsx
import { useRaceFilters } from "../hooks/useRaceFilters";
import { useRaceQuery } from "../hooks/useRaceQuery";
import { useRaceView } from "../hooks/useRaceView";
import { SearchBar } from "../features/races/components/filters/SearchBar";
import { FilterSheet } from "../features/races/components/filters/FilterSheet";
import { ResultsSummary } from "../features/races/components/results/ResultsSummary";
import { RaceGrid } from "../features/races/components/RaceGrid";
import { EmptyState } from "../components/ui/empty-state/EmptyState";
import { HeroSection } from "../features/races/components/hero/HeroSection";
import { ViewSwitcher } from "../features/races/components/view/ViewSwitcher";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Loader2 } from "lucide-react";

function LoadingState() {
    return (
        <div
            className="flex min-h-[400px] items-center justify-center"
            role="status"
            aria-label="Loading races"
        >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}

function ErrorState({ error }: { error: Error }) {
    return (
        <EmptyState
            icon="error"
            title="Error loading races"
            description={error.message || "There was a problem loading the races. Please try again later."}
            action={{
                label: "Try Again",
                onClick: () => window.location.reload()
            }}
        />
    );
}

function RacesPageContent() {
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const {
        view,
        setView,
        handleRaceClick,
        handleViewDetails
    } = useRaceView();

    const {
        filters,
        updateFilter,
        clearFilters,
        hasActiveFilters
    } = useRaceFilters();

    const {
        races,
        isLoading,
        error,
        stats
    } = useRaceQuery({ filters });

    if (error) {
        return <ErrorState error={error} />;
    }

    return (
        <div
            className="container space-y-8 py-8"
            role="main"
            aria-label="Race listings"
        >
            <HeroSection onViewDetails={() => handleViewDetails(races)} />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <ViewSwitcher
                        activeView={view}
                        onViewChange={setView}
                    />
                    <SearchBar
                        onSearch={(value) => updateFilter("search", value)}
                        onOpenFilters={() => setIsFilterSheetOpen(true)}
                        races={races}
                        filters={filters}
                    />
                </div>
                <ResultsSummary
                    total={stats.total}
                    filtered={stats.filtered}
                    filters={filters}
                />
                <FilterSheet
                    open={isFilterSheetOpen}
                    onOpenChange={setIsFilterSheetOpen}
                    races={races}
                    filters={filters}
                    onFilterChange={updateFilter}
                    onClearFilters={clearFilters}
                />
                {isLoading ? (
                    <LoadingState />
                ) : races.length === 0 ? (
                    <EmptyState
                        icon="search"
                        title="No races found"
                        description={
                            hasActiveFilters
                                ? "Try adjusting your filters to find what you're looking for."
                                : "There are no races available at the moment."
                        }
                        action={hasActiveFilters ? {
                            label: "Clear Filters",
                            onClick: clearFilters
                        } : undefined}
                    />
                ) : (
                    <RaceGrid
                        races={races}
                        onRaceClick={handleRaceClick}
                    />
                )}
            </div>
        </div>
    );
}

function FallbackComponent({ error }: { error: Error }) {
    return (
        <EmptyState
            icon="error"
            title="Something went wrong"
            description={error.message}
            action={{
                label: "Try Again",
                onClick: () => window.location.reload()
            }}
        />
    );
}

export function RacesPage() {
    return (
        <ErrorBoundary FallbackComponent={FallbackComponent}>
            <RacesPageContent />
        </ErrorBoundary>
    );
}

export default RacesPage;
```

## RaceDetailsPage.tsx

```tsx
import { useLocation } from 'wouter';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Flag, Calendar, MapPin, Globe2, AlertTriangle } from 'lucide-react';
import { ClientRace } from '@shared/types';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { WeatherAndSchedule } from '../features/races/components/weather-schedule';
import { RaceCountdown } from '../features/races/components/race-countdown/RaceCountdown';
import { SimilarRaces } from '../features/races/components/similar-races/SimilarRaces';
import { EmptyState } from '../components/ui/empty-state/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorBoundary } from 'react-error-boundary';

async function fetchRace(id: string): Promise<ClientRace> {
    const response = await fetch(`/api/races/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch race details');
    }
    return response.json();
}

async function fetchSimilarRaces(id: string): Promise<ClientRace[]> {
    const response = await fetch(`/api/races/${id}/similar`);
    if (!response.ok) {
        throw new Error('Failed to fetch similar races');
    }
    const data = await response.json();
    return data.data;
}

function FallbackComponent({ error }: { error: Error }) {
    const [, setLocation] = useLocation();
    return (
        <EmptyState
            icon="error"
            title="Something went wrong"
            description={error.message}
            action={{
                label: "Go Back",
                onClick: () => setLocation('/')
            }}
        />
    );
}

function RaceDetailsContent() {
    const { id } = useParams<{ id: string }>();
    const [, setLocation] = useLocation();

    const { data: race, isLoading, error } = useQuery<ClientRace, Error>({
        queryKey: ['race', id],
        queryFn: () => fetchRace(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const { data: similarRaces, isLoading: isSimilarLoading, error: similarError } = useQuery<ClientRace[], Error>({
        queryKey: ['similar-races', id],
        queryFn: () => fetchSimilarRaces(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        enabled: !!race,
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error || !race) {
        return (
            <EmptyState
                icon="error"
                title="Race not found"
                description="The race you're looking for doesn't exist or has been removed."
                action={{
                    label: "Go Back",
                    onClick: () => setLocation('/')
                }}
            />
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{race.circuit}, {race.city}, {race.country}</span>
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold">{race.name}</h1>
                    <RaceCountdown raceDate={race.date.toISOString()} />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Book Now</Button>
                    <Button variant="outline" size="sm">Save Race</Button>

                    <Badge variant="outline" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {race.status}
                    </Badge>
                    <Badge variant="outline">
                        {race.is_sprint_weekend ? 'Sprint Weekend' : 'Race Weekend'}
                    </Badge>
                    <Badge variant="outline">
                        {race.season} Season
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Race Details</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(race.date), 'MMMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Globe2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {race.circuit_info?.length} km • {race.circuit_info?.corners} corners
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{race.description}</p>
                    </div>
                </div>

                <WeatherAndSchedule race={race} />
            </div>

            {!isSimilarLoading && similarRaces && (
                <SimilarRaces races={similarRaces} onRaceSelect={(race) => setLocation(`/race/${race.id}`)} />
            )}
        </div>
    );
}

export default function RaceDetails() {
    return (
        <ErrorBoundary FallbackComponent={FallbackComponent}>
            <RaceDetailsContent />
        </ErrorBoundary>
    );
} 
```

