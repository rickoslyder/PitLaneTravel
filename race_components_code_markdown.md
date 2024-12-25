## components/RaceDetails.tsx

```tsx
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { Flag, Calendar, MapPin, Globe2, AlertTriangle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { WeatherAndSchedule } from './weather-schedule';
import { RaceCountdown } from './race-countdown/RaceCountdown';
import { SimilarRaces } from './similar-races/SimilarRaces';
import { EmptyState } from '../../../components/ui/empty-state/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { ErrorBoundary } from 'react-error-boundary';
import type { Race, RaceDetailsProps, SimilarRacesProps } from '../../../types/race';

function transformRaceData(data: any): Race {
    return {
        ...data,
        id: data.id,
        date: data.date,
        weekend_start: data.weekend_start,
        weekend_end: data.weekend_end,
        transport_info: data.transport_info || null,
        weather_info: data.weather_info || null,
        nearest_airports: data.nearest_airports || [],
        supporting_series: data.supporting_series || [],
        last_year_podium: data.last_year_podium ? data.last_year_podium.map((result: any) => ({
            driver: result.driver,
            position: result.position,
            team: result.team,
            time: result.time || undefined
        })) : null,
        local_attractions: data.local_attractions || [],
        schedule: data.schedule || null,
        ticket_info: data.ticket_info || null,
        circuit_info: data.circuit_info || null,
        suggested_itineraries: data.suggested_itineraries || [],
        hotels: data.hotels || [],
        restaurants: data.restaurants || [],
        activities: data.activities || [],
        description: data.description || null,
        image_url: data.image_url || null,
        track_map_url: data.track_map_url || null,
        longitude: data.longitude || null,
        latitude: data.latitude || null,
        price: data.price || null,
        winner: data.winner || null,
        fastest_lap: data.fastest_lap || null,
        laps: data.laps || null,
    };
}

async function fetchRace(raceId: number): Promise<Race> {
    const response = await fetch(`/api/races/${raceId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch race details');
    }
    const data = await response.json();
    return transformRaceData(data);
}

async function fetchSimilarRaces(raceId: number): Promise<Race[]> {
    const response = await fetch(`/api/races/${raceId}/similar`);
    if (!response.ok) {
        throw new Error('Failed to fetch similar races');
    }
    const data = await response.json();
    return data.data.map(transformRaceData);
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

function RaceDetailsContent({ raceId }: RaceDetailsProps) {
    const [, setLocation] = useLocation();

    const { data: race, isLoading, error } = useQuery<Race, Error>({
        queryKey: ['race', raceId],
        queryFn: () => fetchRace(raceId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const { data: similarRaces, isLoading: isSimilarLoading, error: similarError } = useQuery<Race[], Error>({
        queryKey: ['similar-races', raceId],
        queryFn: () => fetchSimilarRaces(raceId),
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
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{race.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{race.circuit}, {race.country}</span>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-4 md:items-end">
                    <RaceCountdown raceDate={race.date} className="text-sm" />
                    {race.availability === 'available' ? (
                        <Button className="bg-[#E10600] hover:bg-[#FF0800]">
                            Book Tickets
                        </Button>
                    ) : race.availability === 'sold_out' ? (
                        <Badge variant="destructive" className="px-3 py-1">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Sold Out
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="px-3 py-1">
                            Coming Soon
                        </Badge>
                    )}
                </div>
            </div>

            <div className="aspect-[21/9] overflow-hidden rounded-lg border bg-card">
                <img
                    src={race.image_url || "https://images.unsplash.com/photo-1504707748692-419802cf939d"}
                    alt={race.name}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    <Flag className="h-5 w-5 text-[#E10600]" />
                    <div>
                        <p className="text-sm font-medium">Grand Prix</p>
                        <p className="text-sm text-muted-foreground">{race.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    <Calendar className="h-5 w-5 text-[#E10600]" />
                    <div>
                        <p className="text-sm font-medium">Race Date</p>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(race.date), 'PPP')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    <Globe2 className="h-5 w-5 text-[#E10600]" />
                    <div>
                        <p className="text-sm font-medium">Circuit</p>
                        <p className="text-sm text-muted-foreground">{race.circuit}</p>
                    </div>
                </div>
            </div>

            {race.description && (
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-3">About the Race</h2>
                    <p className="text-muted-foreground">{race.description}</p>
                </div>
            )}

            <WeatherAndSchedule race={race} />

            <SimilarRaces
                races={similarRaces || []}
                isLoading={isSimilarLoading}
                error={similarError}
                onRaceSelect={(raceId: number) => setLocation(`/race/${raceId}`)}
            />
        </div>
    );
}

export function RaceDetails(props: RaceDetailsProps) {
    return (
        <ErrorBoundary FallbackComponent={FallbackComponent}>
            <RaceDetailsContent {...props} />
        </ErrorBoundary>
    );
} 
```

## components/RaceCard.tsx

```tsx
import { format } from 'date-fns';
import { MapPin, Calendar, Flag } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import type { RaceCardProps } from '../../../types/race';

export function RaceCard({ race, onClick }: RaceCardProps) {
  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[16/9] overflow-hidden">
        <img
          src={race.image_url || "https://images.unsplash.com/photo-1504707748692-419802cf939d"}
          alt={race.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-medium">
            {format(new Date(race.date), 'MMM d')}
          </Badge>
          {race.availability === 'available' ? (
            <Badge>Available</Badge>
          ) : race.availability === 'sold_out' ? (
            <Badge variant="destructive">Sold Out</Badge>
          ) : (
            <Badge variant="secondary">Coming Soon</Badge>
          )}
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{race.name}</h3>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          {race.circuit}, {race.country}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-1 h-4 w-4" />
          {format(new Date(race.date), 'EEEE, MMMM d, yyyy')}
        </div>
        {race.is_sprint_weekend && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Flag className="mr-1 h-4 w-4" />
            Sprint Race Weekend
          </div>
        )}
      </CardContent>
    </Card>
  );
}

```

## components/RaceCalendar.tsx

```tsx
import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { RaceGrid } from './RaceGrid';
import { WorldMap } from './WorldMap';
import { useRaces } from '../hooks/useRaces';
import type { ClientRace as Race } from '@shared/types/unified';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

export function RaceCalendar() {
    const [, setLocation] = useLocation();
    const { data: races, isLoading, error } = useRaces();

    const handleRaceClick = useCallback((race: Race) => {
        setLocation(`/race/${race.id}`);
    }, [setLocation]);

    return (
        <Tabs defaultValue="grid">
            <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="mt-6">
                <RaceGrid
                    races={races || []}
                    onRaceClick={handleRaceClick}
                />
            </TabsContent>
            <TabsContent value="map" className="mt-6">
                <div className="aspect-[21/9] rounded-lg border bg-card">
                    <WorldMap
                        races={races || []}
                        onRaceSelect={handleRaceClick}
                    />
                </div>
            </TabsContent>
        </Tabs>
    );
} 
```

## components/WorldMap.tsx

```tsx
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ClientRace as Race } from '@shared/types/unified';
import { env } from '../../../lib/env';

mapboxgl.accessToken = env.VITE_MAPBOX_TOKEN;

interface WorldMapProps {
    races: Race[];
    onRaceSelect: (race: Race) => void;
}

export function WorldMap({ races, onRaceSelect }: WorldMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [0, 20],
            zoom: 1.5
        });

        const nav = new mapboxgl.NavigationControl();
        map.current.addControl(nav, 'top-right');

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add markers for each race
        races.forEach(race => {
            if (!race.longitude || !race.latitude || !map.current) return;

            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class="p-2">
                    <h3 class="font-semibold">${race.name}</h3>
                    <p class="text-sm text-muted-foreground">${race.circuit}</p>
                </div>
            `);

            const marker = new mapboxgl.Marker({
                color: '#E10600'
            })
                .setLngLat([race.longitude, race.latitude])
                .setPopup(popup)
                .addTo(map.current);

            marker.getElement().addEventListener('click', () => {
                onRaceSelect(race);
            });

            markers.current.push(marker);
        });
    }, [races, onRaceSelect]);

    return (
        <div ref={mapContainer} className="h-full w-full" />
    );
} 
```

## components/RaceGrid.tsx

```tsx
import { RaceCard } from './RaceCard';
import type { Race } from '@/types/race';

interface RaceGridProps {
    races: Race[];
    onRaceClick?: (race: Race) => void;
}

export function RaceGrid({ races, onRaceClick }: RaceGridProps) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {races.map((race) => (
                <RaceCard
                    key={race.id}
                    race={race}
                    onClick={() => onRaceClick?.(race)}
                />
            ))}
        </div>
    );
}
```

## components/series/RaceSeriesBadges.tsx

```tsx
import { Badge } from "@/components/ui/badge";
import { SupportingSeries } from "@/types/race";
import { cn } from "@/lib/utils";

interface RaceSeriesBadgesProps {
    /** List of supporting series to display */
    supportingSeries: SupportingSeries[];
    /** Additional CSS classes */
    className?: string;
}

export function RaceSeriesBadges({ supportingSeries, className }: RaceSeriesBadgesProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {supportingSeries.map((series, index) => (
                <Badge key={index} variant="secondary">
                    {series.name}
                </Badge>
            ))}
        </div>
    );
} 
```

## components/filters/SearchBar.tsx

```tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Race } from "@/types/race";
import { cn } from "@/lib/utils";
import { FilterOptions } from "@/lib/utils/raceFilters";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
    /** Callback when search value changes */
    onSearch: (value: string) => void;
    /** Callback to open filters panel */
    onOpenFilters: () => void;
    /** List of races to search */
    races: Race[];
    /** Current filter options */
    filters: FilterOptions;
    /** Additional CSS classes */
    className?: string;
}

function getActiveFilterCount(filters: FilterOptions): number {
    return Object.entries(filters).reduce((count, [key, value]) => {
        if (key === 'search' || key === 'sortBy') return count;
        if (Array.isArray(value)) {
            return count + value.length;
        }
        return count;
    }, 0);
}

export function SearchBar({
    onSearch,
    onOpenFilters,
    races,
    filters,
    className,
}: SearchBarProps) {
    const [searchValue, setSearchValue] = useState(filters.search);
    const debouncedSearch = useDebounce(searchValue, 300);
    const activeFilterCount = getActiveFilterCount(filters);

    // Update search value when filters change
    useEffect(() => {
        setSearchValue(filters.search);
    }, [filters.search]);

    // Handle search input change
    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);
    }, []);

    // Trigger search when debounced value changes
    useEffect(() => {
        onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);

    return (
        <div
            className={cn("flex items-center gap-2", className)}
            role="search"
            aria-label="Search races"
        >
            <div className="relative flex-1">
                <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                />
                <Input
                    type="search"
                    placeholder="Search races..."
                    className="pl-9"
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    aria-label="Search races"
                />
            </div>
            <Button
                variant="outline"
                size="icon"
                onClick={onOpenFilters}
                className="relative shrink-0"
                aria-label={`Open filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
            >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                {activeFilterCount > 0 && (
                    <span
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                        aria-hidden="true"
                    >
                        {activeFilterCount}
                    </span>
                )}
            </Button>
        </div>
    );
} 
```

## components/filters/FilterSheet.tsx

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FilterOptions, getFilterGroups } from "@/lib/utils/raceFilters";
import { type FilterGroup as FilterGroupType } from "@/lib/utils/raceFilters/types";
import { FilterGroupComponent } from "@/features/races/components/filters/FilterGroup";
import { Race } from "@/types/race";
import { getActiveFilterCount, formatFilterCount } from "@/lib/utils/filters";

interface FilterSheetProps {
    /** Whether the filter sheet is open */
    open: boolean;
    /** Callback when the open state changes */
    onOpenChange: (open: boolean) => void;
    /** List of races to filter */
    races: Race[];
    /** Current filter options */
    filters: FilterOptions;
    /** Callback when a filter changes */
    onFilterChange: (field: keyof FilterOptions, value: string[]) => void;
    /** Callback to clear all filters */
    onClearFilters: () => void;
}

export function FilterSheet({
    open,
    onOpenChange,
    races,
    filters,
    onFilterChange,
    onClearFilters,
}: FilterSheetProps) {
    const filterGroups: FilterGroupType[] = getFilterGroups(races);
    const activeFilterCount = getActiveFilterCount(filters);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="w-full sm:max-w-md"
                role="dialog"
                aria-label="Race filters"
            >
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>Filters</SheetTitle>
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                className="h-auto p-0 text-muted-foreground"
                                onClick={onClearFilters}
                                aria-label="Clear all filters"
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                </SheetHeader>
                <Separator className="my-4" />
                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div
                        className="space-y-4 pb-4"
                        role="group"
                        aria-label="Filter options"
                    >
                        {filterGroups.map((group) => (
                            <FilterGroupComponent
                                key={group.name}
                                name={group.name}
                                options={group.options}
                                selectedValues={
                                    filters[group.name.toLowerCase() as keyof FilterOptions] as string[] || []
                                }
                                onChange={(values: string[]) =>
                                    onFilterChange(
                                        group.name.toLowerCase() as keyof FilterOptions,
                                        values
                                    )
                                }
                            />
                        ))}
                    </div>
                </ScrollArea>
                {activeFilterCount > 0 && (
                    <div
                        className="flex items-center gap-2 pt-4"
                        aria-live="polite"
                    >
                        <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                        >
                            {formatFilterCount(activeFilterCount)}
                        </Badge>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
} 
```

## components/filters/FilterGroup.tsx

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { FilterGroup as FilterGroupType } from "@/lib/utils/raceFilters/types";

interface FilterGroupProps {
    /** The name of the filter group */
    name: FilterGroupType['name'];
    /** The available options in this group */
    options: FilterGroupType['options'];
    /** Currently selected values */
    selectedValues: string[];
    /** Callback when selection changes */
    onChange: (values: string[]) => void;
}

export function FilterGroupComponent({
    name,
    options,
    selectedValues,
    onChange
}: FilterGroupProps) {
    const handleChange = (checked: boolean, value: string) => {
        if (checked) {
            onChange([...selectedValues, value]);
        } else {
            onChange(selectedValues.filter((v) => v !== value));
        }
    };

    return (
        <div
            className="space-y-3"
            role="group"
            aria-labelledby={`${name}-heading`}
        >
            <h4
                id={`${name}-heading`}
                className="font-medium"
            >
                {name}
            </h4>
            <div className="space-y-2">
                {options.map((option) => {
                    const checkboxId = `${name}-${option.value}`;
                    return (
                        <div
                            key={option.value}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={checkboxId}
                                    checked={selectedValues.includes(option.value)}
                                    onCheckedChange={(checked) =>
                                        handleChange(checked as boolean, option.value)
                                    }
                                    aria-label={`${option.label} (${option.count} races)`}
                                />
                                <Label
                                    htmlFor={checkboxId}
                                    className="text-sm font-normal"
                                >
                                    {option.label}
                                </Label>
                            </div>
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal"
                                aria-label={`${option.count} races`}
                            >
                                {option.count}
                            </Badge>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Export with renamed type to avoid conflicts
export { FilterGroupComponent as FilterGroup }; 
```

## components/tickets/TicketSection.tsx

```tsx
import type { ClientRace, TicketInfo } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TicketSectionProps {
    race: ClientRace;
}

export function TicketSection({ race }: TicketSectionProps) {
    const tickets = race.ticket_info || [];

    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-bold">Tickets</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket: TicketInfo, index: number) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{ticket.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-muted-foreground">{ticket.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold">{ticket.price}</span>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(ticket.reseller_url, "_blank")}
                                        disabled={ticket.availability === "sold_out"}
                                    >
                                        {ticket.availability === "sold_out" ? "Sold Out" : "Buy Now"}
                                    </Button>
                                </div>
                                {ticket.features && ticket.features.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Features:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {ticket.features.map((feature: string, i: number) => (
                                                <li key={i}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
} 
```

## components/schedule/ScheduleCard.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Schedule } from "@/types/race";
import { ScheduleEvent } from "./ScheduleEvent";
import { sortScheduleEvents, isEventInProgress } from "@/lib/utils/schedule";
import { ErrorBoundary } from "react-error-boundary";

export interface ScheduleCardProps {
    /** The schedule data to display */
    schedule: Schedule | null;
}

function ScheduleCardContent({ schedule }: ScheduleCardProps) {
    if (!schedule) {
        return (
            <p className="text-muted-foreground">No schedule available</p>
        );
    }

    const events = sortScheduleEvents(schedule);

    if (events.length === 0) {
        return (
            <p className="text-muted-foreground">No events scheduled</p>
        );
    }

    return (
        <div className="space-y-2">
            {events.map(event => (
                <ScheduleEvent
                    key={event.name}
                    event={event}
                    isActive={isEventInProgress(event)}
                />
            ))}
        </div>
    );
}

function FallbackComponent({ error }: { error: Error }) {
    return (
        <div className="text-destructive">
            <p>Error loading schedule: {error.message}</p>
        </div>
    );
}

export function ScheduleCard(props: ScheduleCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <ErrorBoundary FallbackComponent={FallbackComponent}>
                    <ScheduleCardContent {...props} />
                </ErrorBoundary>
            </CardContent>
        </Card>
    );
} 
```

## components/schedule/RaceSchedule.tsx

```tsx
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Timer } from "lucide-react";
import type { Schedule } from "@/types/race";

interface RaceScheduleProps {
    /** The schedule data containing session information */
    schedule: Schedule | null;
}

export function RaceSchedule({ schedule }: RaceScheduleProps) {
    if (!schedule) {
        return (
            <Card className="p-6">
                <div className="space-y-4">
                    <h3 className="font-semibold">Race Schedule</h3>
                    <p className="text-muted-foreground">No schedule available</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <h3 className="font-semibold">Race Schedule</h3>
                <div className="space-y-3">
                    {Object.entries(schedule).map(([type, session]) => session && (
                        <div
                            key={type}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Timer className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {format(new Date(`${session.date}T${session.time}`), "MMMM d 'at' HH:mm")}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
} 
```

## components/schedule/ScheduleEvent.tsx

```tsx
import { cn } from "@/lib/utils";
import { ScheduleEvent as ScheduleEventType } from "@/lib/utils/schedule";
import { Clock } from "lucide-react";

interface ScheduleEventProps {
    /** The event to display */
    event: ScheduleEventType;
    /** Whether the event is currently active */
    isActive?: boolean;
}

export function ScheduleEvent({ event, isActive }: ScheduleEventProps) {
    return (
        <div className="grid grid-cols-[1fr,auto] gap-2 rounded-lg p-2 transition-colors hover:bg-accent">
            <div className="space-y-1">
                <p className={cn(
                    "font-medium",
                    isActive && "text-primary"
                )}>
                    {event.formattedName}
                </p>
                {isActive && (
                    <div className="flex items-center gap-1 text-sm text-primary">
                        <Clock className="h-3 w-3" />
                        <span>In Progress</span>
                    </div>
                )}
            </div>
            <div>
                <p className={cn(
                    "text-muted-foreground",
                    isActive && "text-primary"
                )}>
                    {event.formattedTime}
                </p>
            </div>
        </div>
    );
} 
```

## components/calendar/RaceCalendar.tsx

```tsx
import { useState, useMemo, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { addMonths, format, subMonths, isSameMonth, isSameDay, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Timer } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { Race } from "@/types/race";
import { UpcomingRaces } from "../race/UpcomingRaces";

interface RaceCalendarProps {
    races: Race[];
    onRaceClick: (race: Race) => void;
}

export function RaceCalendar({ races, onRaceClick }: RaceCalendarProps) {
    const [date, setDate] = useState(new Date());

    const handlePreviousMonth = useCallback(() => {
        setDate(subMonths(date, 1));
    }, [date]);

    const handleNextMonth = useCallback(() => {
        setDate(addMonths(date, 1));
    }, [date]);

    const racesInMonth = useMemo(() => {
        return races.filter((race) => isSameMonth(new Date(race.date), date));
    }, [races, date]);

    const modifiers = useMemo(() => ({
        race: races.map(race => new Date(race.date))
    }), [races]);

    const modifiersClassNames = {
        race: cn(
            "relative bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-primary before:rounded-t-md"
        )
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousMonth}
                        disabled={date < new Date()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="font-semibold">
                        {format(date, "MMMM yyyy")}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextMonth}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                    {racesInMonth.length} races this month
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                        if (newDate) {
                            setDate(newDate);
                            const race = races.find(race => isSameDay(new Date(race.date), newDate));
                            if (race) {
                                onRaceClick(race);
                            }
                        }
                    }}
                    className="rounded-md border"
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    disabled={(date) => date < subDays(new Date(), 1)}
                />

                <UpcomingRaces
                    races={races}
                    onRaceSelect={onRaceClick}
                    variant="card"
                />
            </div>

            {/* Race details hover cards */}
            {races.map((race) => (
                <HoverCard key={race.id}>
                    <HoverCardTrigger className="hidden">
                        {/* Hidden trigger for the hover card */}
                        <div data-race-date={format(new Date(race.date), "yyyy-MM-dd")} />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">{race.name}</h4>
                            <div className="text-sm space-y-1">
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {race.circuit}, {race.city}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Timer className="h-3 w-3 mr-1" />
                                    {format(new Date(race.date), "PPP")}
                                </div>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            ))}
        </div>
    );
} 
```

## components/countdown/RaceCountdown.tsx

```tsx
import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from 'lucide-react';

interface RaceCountdownProps {
    /** The date of the race */
    raceDate: string;
    /** Additional CSS classes */
    className?: string;
}

type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export function RaceCountdown({ raceDate, className = '' }: RaceCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [status, setStatus] = useState<'upcoming' | 'imminent' | 'past'>('upcoming');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(raceDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                setStatus('past');
                return null;
            }

            const timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };

            if (timeLeft.days <= 7) {
                setStatus('imminent');
            }

            return timeLeft;
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [raceDate]);

    if (!timeLeft) {
        return (
            <Badge variant="secondary" className={className}>
                Race Completed
            </Badge>
        );
    }

    if (status === 'imminent') {
        return (
            <Badge variant="destructive" className={`animate-pulse ${className}`}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Starting Soon: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </Badge>
        );
    }

    return (
        <Badge variant="secondary" className={className}>
            <Clock className="w-3 h-3 mr-1" />
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </Badge>
    );
} 
```

## components/booking/TicketBooking.tsx

```tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Ticket, Hotel, Calendar, Info } from "lucide-react";
import { format } from "date-fns";
import type { Race } from "@/types/race";

interface TicketType {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
}

interface TicketBookingProps {
    /** The race data for ticket booking */
    race: Race;
}

const ticketTypes: TicketType[] = [
    {
        id: "general",
        name: "General Admission",
        price: 200,
        description: "Access to general viewing areas",
        features: ["General access to the circuit", "Standing viewing areas", "Access to food courts"]
    },
    {
        id: "grandstand",
        name: "Grandstand Seating",
        price: 500,
        description: "Reserved seating with excellent views",
        features: ["Reserved seat", "Covered seating area", "TV screens", "Premium facilities"]
    }
];

export function TicketBooking({ race }: TicketBookingProps) {
    const [selectedTicket, setSelectedTicket] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [includeHotel, setIncludeHotel] = useState(false);

    const selectedTicketInfo = ticketTypes.find(t => t.id === selectedTicket);
    const basePrice = selectedTicketInfo?.price || 0;
    const quantity_num = parseInt(quantity);
    const hotelPrice = includeHotel ? 300 : 0;
    const total = (basePrice * quantity_num) + hotelPrice;

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Ticket Selection */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {ticketTypes.map((ticket) => (
                        <Card
                            key={ticket.id}
                            className={`relative cursor-pointer transition-all ${selectedTicket === ticket.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''}`}
                            onClick={() => setSelectedTicket(ticket.id)}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {ticket.name}
                                    <Badge variant="secondary">${ticket.price}</Badge>
                                </CardTitle>
                                <CardDescription>{ticket.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {ticket.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Options */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Number of Tickets</Label>
                            <Select value={quantity} onValueChange={setQuantity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select quantity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4].map((num) => (
                                        <SelectItem key={num} value={num.toString()}>
                                            {num} {num === 1 ? 'ticket' : 'tickets'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hotel"
                                checked={includeHotel}
                                onCheckedChange={(checked) => setIncludeHotel(checked as boolean)}
                            />
                            <Label htmlFor="hotel" className="flex items-center gap-2">
                                <Hotel className="h-4 w-4" />
                                Include 3 nights hotel stay (+$300)
                            </Label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Review your race package</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Race Tickets</span>
                            <span>${basePrice * quantity_num}</span>
                        </div>
                        {includeHotel && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Hotel Package</span>
                                <span>${hotelPrice}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>${total}</span>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{race.weekend_start ? format(new Date(race.weekend_start), 'MMM d') : ''} - {race.weekend_end ? format(new Date(race.weekend_end), 'MMM d, yyyy') : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Tickets will be delivered electronically</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={!selectedTicket}
                    >
                        <Ticket className="mr-2 h-4 w-4" />
                        Proceed to Checkout
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
} 
```

## components/similar-races/SimilarRaces.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Timer } from "lucide-react";
import { format } from "date-fns";
import type { Race } from "@/types/race";

interface SimilarRacesProps {
    /** List of similar races */
    races: Race[];
    /** Callback when a race is selected */
    onRaceSelect?: (race: Race) => void;
}

export function SimilarRaces({ races, onRaceSelect }: SimilarRacesProps) {
    if (!races.length) {
        return null;
    }

    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-bold">Similar Races</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {races.map((race) => (
                    <Card key={race.id} className="cursor-pointer hover:bg-accent/50" onClick={() => onRaceSelect?.(race)}>
                        <CardHeader>
                            <CardTitle className="text-lg">{race.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{race.circuit}, {race.country}</span>
                                    </div>
                                    <Badge variant={race.availability === "sold_out" ? "destructive" : "secondary"}>
                                        {race.availability === "sold_out" ? "Sold Out" : "Available"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Timer className="h-4 w-4" />
                                    <span>{format(new Date(race.date), "MMMM d, yyyy")}</span>
                                </div>
                                {race.price && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold">{race.price}</span>
                                        <Button variant="outline" size="sm">View Details</Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
} 
```

## components/circuit/CircuitGuide.tsx

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Timer, Flag, Car, MapPin, Clock, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Race, WeatherInfo } from "@/types/race";
import { format } from "date-fns";

interface CircuitGuideProps {
    /** The race data containing circuit information */
    race: Race;
}

export function CircuitGuide({ race }: CircuitGuideProps) {
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card className="backdrop-blur-sm bg-background/95 border-border/50">
                <CardContent className="pt-8">
                    <h3 className="text-xl font-semibold mb-6">Circuit Information</h3>
                    <Accordion type="single" collapsible>
                        {/* Circuit Layout */}
                        <AccordionItem value="layout">
                            <AccordionTrigger className="text-base hover:text-primary transition-colors">
                                Circuit Layout
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-6">
                                    {race.track_map_url && (
                                        <div className="relative overflow-hidden rounded-lg group">
                                            <img
                                                src={race.track_map_url}
                                                alt={`${race.circuit} layout`}
                                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    )}
                                    {race.circuit_info && (
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="space-y-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    <p className="text-sm text-muted-foreground">Circuit Length</p>
                                                </div>
                                                <p className="font-medium">{race.circuit_info.length}</p>
                                            </div>
                                            <div className="space-y-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                                                <div className="flex items-center space-x-2">
                                                    <Car className="w-4 h-4 text-primary" />
                                                    <p className="text-sm text-muted-foreground">Corners</p>
                                                </div>
                                                <p className="font-medium">{race.circuit_info.corners}</p>
                                            </div>
                                            <div className="space-y-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                                                <div className="flex items-center space-x-2">
                                                    <Flag className="w-4 h-4 text-primary" />
                                                    <p className="text-sm text-muted-foreground">DRS Zones</p>
                                                </div>
                                                <p className="font-medium">{race.circuit_info.drsZones}</p>
                                            </div>
                                            {race.circuit_info.lapRecord && (
                                                <div className="space-y-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                                                    <div className="flex items-center space-x-2">
                                                        <Trophy className="w-4 h-4 text-primary" />
                                                        <p className="text-sm text-muted-foreground">Lap Record</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{race.circuit_info.lapRecord.time}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {race.circuit_info.lapRecord.driver} ({race.circuit_info.lapRecord.year})
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Nearest Airports */}
                        <AccordionItem value="airports">
                            <AccordionTrigger className="text-base hover:text-primary transition-colors">
                                Travel Information
                            </AccordionTrigger>
                            <AccordionContent>
                                {race.nearest_airports && race.nearest_airports.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="text-primary/70">Airport</TableHead>
                                                <TableHead className="text-primary/70 text-right">Distance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {race.nearest_airports.map((airport) => (
                                                <TableRow key={airport.code} className="group transition-all duration-200 hover:bg-accent/50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                                <Plane className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">{airport.name}</span>
                                                                <Badge variant="outline" className="ml-2">{airport.code}</Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="inline-flex items-center space-x-1">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>{airport.transferTime}</span>
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Travel information not available</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Local Attractions */}
                        {race.local_attractions && race.local_attractions.length > 0 && (
                            <AccordionItem value="attractions">
                                <AccordionTrigger className="text-base hover:text-primary transition-colors">
                                    Local Attractions
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                        {race.local_attractions.map((attraction) => (
                                            <div key={attraction.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200">
                                                <h4 className="font-medium mb-2">{attraction.name}</h4>
                                                <p className="text-sm text-muted-foreground">{attraction.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                </CardContent>
            </Card>

            {/* Weather and Track Conditions */}
            <Card className="backdrop-blur-sm bg-background/95 border-border/50">
                <CardContent className="pt-8">
                    <h3 className="text-xl font-semibold mb-6">Track Conditions</h3>
                    {race.weather_info ? (
                        <div className="grid grid-cols-2 gap-4">
                            {(Object.entries(race.weather_info) as Array<[keyof WeatherInfo, any]>).map(([key, value]) => (
                                <div key={String(key)} className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {String(key).replace('_', ' ')}
                                    </p>
                                    <p className="font-medium mt-1">
                                        {typeof value === 'boolean'
                                            ? value ? 'Yes' : 'No'
                                            : typeof value === 'number'
                                                ? value.toString()
                                                : value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">Weather information not available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 
```

## components/circuit/CircuitDetails.tsx

```tsx
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Trophy,
    Ruler,
    CornerUpRight,
    Zap,
    MapPin,
    Calendar,
    ArrowRight,
    Ticket,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Race, CircuitInfo } from '@/types/race';
import { format } from 'date-fns';

function isCircuitInfo(info: unknown): info is CircuitInfo {
    if (!info || typeof info !== 'object') return false;

    const circuitInfo = info as Partial<CircuitInfo>;
    return (
        typeof circuitInfo.length === 'number' &&
        typeof circuitInfo.corners === 'number' &&
        typeof circuitInfo.drsZones === 'number' &&
        typeof circuitInfo.firstGrandPrix === 'number' &&
        typeof circuitInfo.capacity === 'number' &&
        typeof circuitInfo.lapRecord === 'object' &&
        circuitInfo.lapRecord !== null &&
        typeof circuitInfo.lapRecord.time === 'string' &&
        typeof circuitInfo.lapRecord.driver === 'string' &&
        typeof circuitInfo.lapRecord.year === 'number'
    );
}

interface CircuitDetailsProps {
    /** The race data containing circuit information */
    race: Race;
    /** Callback when the view details button is clicked */
    onViewDetails?: () => void;
    /** Callback when the book now button is clicked */
    onBookNow?: () => void;
}

export function CircuitDetails({ race, onViewDetails, onBookNow }: CircuitDetailsProps) {
    const isPastDate = new Date(race.date) < new Date();

    if (!race.circuit_info || !isCircuitInfo(race.circuit_info)) {
        return (
            <Card>
                <CardContent>
                    <p>Circuit information not available</p>
                </CardContent>
            </Card>
        );
    }

    const circuitInfo = race.circuit_info;

    return (
        <div className="grid gap-6">
            {/* Hero Image */}
            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
                <img
                    src={race.image_url || "https://images.unsplash.com/photo-1504707748692-419802cf939d"}
                    alt={race.circuit}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="p-6 bg-black/40">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-white tracking-tight">{race.name}</h2>
                                {race.is_sprint_weekend && (
                                    <Badge variant="secondary" className="bg-white/10 text-white">Sprint Weekend</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <MapPin className="h-4 w-4" />
                                <p>{race.circuit}, {race.country}</p>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <Calendar className="h-4 w-4" />
                                <div>
                                    <p>{format(new Date(race.date), 'MMMM d, yyyy')}</p>
                                    {race.weekend_start && race.weekend_end && (
                                        <p className="text-white/80 text-sm">
                                            Race Weekend: {format(new Date(race.weekend_start), 'MMM d')} - {format(new Date(race.weekend_end), 'MMM d')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {race.availability === "sold_out" ? (
                                <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                                    Sold Out
                                </Badge>
                            ) : isPastDate ? (
                                <Badge variant="secondary" className="bg-muted/10 text-muted-foreground">
                                    Past Event
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    Available
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-[#E10600]" />
                        <CardTitle className="text-xl font-bold">Circuit Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-2">
                            <Ruler className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Track Length</p>
                                <p className="text-2xl font-bold tracking-tight">{circuitInfo.length}km</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CornerUpRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Corners</p>
                                <p className="text-2xl font-bold tracking-tight">{circuitInfo.corners}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Zap className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">DRS Zones</p>
                                <p className="text-2xl font-bold tracking-tight">{circuitInfo.drsZones}</p>
                            </div>
                        </div>
                    </div>
                    {race.description && (
                        <div className="mt-6 text-sm text-muted-foreground">
                            {race.description}
                        </div>
                    )}
                </CardContent>
            </Card>

            {circuitInfo.lapRecord && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-[#E10600]" />
                            <CardTitle className="text-lg font-semibold">Lap Record</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between">
                                <p className="text-sm font-medium text-muted-foreground">Time</p>
                                <p className="text-2xl font-bold tracking-tight font-mono">{circuitInfo.lapRecord.time}</p>
                            </div>
                            <Separator />
                            <div className="flex items-baseline justify-between">
                                <p className="text-sm font-medium text-muted-foreground">Driver</p>
                                <div className="text-right">
                                    <p className="text-base font-semibold">{circuitInfo.lapRecord.driver}</p>
                                    <p className="text-sm text-muted-foreground">Set in {circuitInfo.lapRecord.year}</p>
                                </div>
                            </div>
                            {(circuitInfo.lapRecord.sector1 || circuitInfo.lapRecord.sector2 || circuitInfo.lapRecord.sector3) && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Sector Times</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            {circuitInfo.lapRecord.sector1 && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Sector 1</p>
                                                    <p className="font-mono font-medium">{circuitInfo.lapRecord.sector1}</p>
                                                </div>
                                            )}
                                            {circuitInfo.lapRecord.sector2 && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Sector 2</p>
                                                    <p className="font-mono font-medium">{circuitInfo.lapRecord.sector2}</p>
                                                </div>
                                            )}
                                            {circuitInfo.lapRecord.sector3 && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Sector 3</p>
                                                    <p className="font-mono font-medium">{circuitInfo.lapRecord.sector3}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-4 mt-4">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={onViewDetails}
                >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    View Details
                </Button>
                {!isPastDate && race.availability !== "sold_out" && (
                    <Button
                        variant="default"
                        className="w-full bg-[#E10600] hover:bg-[#FF0800]"
                        onClick={onBookNow}
                    >
                        <Ticket className="mr-2 h-4 w-4" />
                        Book Now
                    </Button>
                )}
            </div>
        </div>
    );
} 
```

## components/race-countdown/RaceCountdown.tsx

```tsx
import { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { cn } from '../../../../lib/utils';
import type { RaceCountdownProps } from '../../../../types/race';

export function RaceCountdown({ raceDate, className }: RaceCountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const race = new Date(raceDate);

            if (race <= now) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: differenceInDays(race, now),
                hours: differenceInHours(race, now) % 24,
                minutes: differenceInMinutes(race, now) % 60,
                seconds: differenceInSeconds(race, now) % 60
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [raceDate]);

    if (new Date(raceDate) <= new Date()) {
        return null;
    }

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="text-center">
                <p className="font-bold">{timeLeft.days}</p>
                <p className="text-xs text-muted-foreground">Days</p>
            </div>
            <div className="text-center">
                <p className="font-bold">{timeLeft.hours}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div className="text-center">
                <p className="font-bold">{timeLeft.minutes}</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div className="text-center">
                <p className="font-bold">{timeLeft.seconds}</p>
                <p className="text-xs text-muted-foreground">Seconds</p>
            </div>
        </div>
    );
} 
```

## components/results/ResultsSummary.tsx

```tsx
import { Badge } from "@/components/ui/badge";
import { FilterOptions } from "@/lib/utils/raceFilters";
import {
    getActiveFilterSummaries,
    hasActiveFilters,
    formatFilterCount
} from "@/lib/utils/filterSummary";

interface ResultsSummaryProps {
    /** Total number of races before filtering */
    total: number;
    /** Number of races after filtering */
    filtered: number;
    /** Current filter options */
    filters: FilterOptions;
}

export function ResultsSummary({
    total,
    filtered,
    filters
}: ResultsSummaryProps) {
    const activeFilters = getActiveFilterSummaries(filters);
    const showFilters = hasActiveFilters(filters);
    const summaryText = formatFilterCount(total, filtered);

    return (
        <div
            className="flex flex-wrap items-center gap-2"
            role="status"
            aria-label="Search results summary"
        >
            <p
                className="text-sm text-muted-foreground"
                aria-live="polite"
            >
                {summaryText}
            </p>
            {showFilters && (
                <div
                    className="flex flex-wrap gap-2"
                    role="list"
                    aria-label="Active filters"
                >
                    {activeFilters.map((filter) => (
                        <Badge
                            key={`${filter.label}-${filter.value}`}
                            variant="secondary"
                            role="listitem"
                        >
                            <span className="font-medium">{filter.label}:</span>
                            {' '}
                            <span>{filter.value}</span>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
} 
```

## components/list/RaceListHeader.tsx

```tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface RaceListHeaderProps {
    onBack: () => void;
}

export function RaceListHeader({ onBack }: RaceListHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" onClick={onBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
        </div>
    );
} 
```

## components/race/UpcomingRaces.tsx

```tsx
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Race } from "@/types/race";
import { MapPin, Timer } from "lucide-react";

interface UpcomingRacesProps {
    /** List of upcoming races to display */
    races: Race[];
    /** Callback when a race is selected */
    onRaceSelect: (race: Race) => void;
    /** Display variant - either as a card or plain */
    variant?: 'card' | 'plain';
    /** Additional CSS classes */
    className?: string;
}

export function UpcomingRaces({ races, onRaceSelect, variant = 'card', className }: UpcomingRacesProps) {
    const getAvailabilityBadge = (availability: Race['availability']) => {
        switch (availability) {
            case "sold_out":
                return <Badge variant="destructive">Sold Out</Badge>;
            case "low_stock":
                return <Badge>Low Stock</Badge>;
            case "pending":
                return <Badge variant="secondary">Coming Soon</Badge>;
            default:
                return <Badge variant="secondary">Available</Badge>;
        }
    };

    const content = (
        <div className="space-y-4">
            <h3 className="font-semibold">Upcoming Races</h3>
            <div className="space-y-3">
                {races.map((race) => (
                    <div
                        key={race.id}
                        className="flex items-center justify-between gap-4"
                    >
                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium truncate">{race.name}</h4>
                                {getAvailabilityBadge(race.availability)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{race.circuit}, {race.country}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Timer className="h-3 w-3" />
                                    <span>{format(new Date(race.date), "HH:mm")}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRaceSelect(race)}
                            >
                                View
                            </Button>
                            <Button
                                size="sm"
                                disabled={race.availability === "sold_out"}
                                onClick={() => window.location.href = `/races/${race.id}/book`}
                            >
                                Book
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (variant === 'card') {
        return (
            <Card className={cn("p-6", className)}>
                {content}
            </Card>
        );
    }

    return (
        <div className={className}>
            {content}
        </div>
    );
} 
```

## components/race/RaceTickets.tsx

```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { Race, TicketInfo } from "@/types/race";
import { useQuery } from "@tanstack/react-query";
import { getRaceTickets } from "@/lib/api/races";

interface RaceTicketsProps {
    /** The race data containing ticket information */
    race: Race;
}

export function RaceTickets({ race }: RaceTicketsProps) {
    const { data: tickets, isLoading } = useQuery<TicketInfo[]>({
        queryKey: ["race-tickets", race.id],
        queryFn: async () => {
            const response = await getRaceTickets(race.id);
            return response.map((booking) => ({
                title: booking.bookingId,
                description: `${booking.tickets[0].quantity} tickets at ${booking.currency} ${booking.tickets[0].unitPrice}`,
                price: `${booking.currency} ${booking.totalAmount}`,
                ticketType: "1_DAY",
                availability: booking.status === "confirmed" ? "available" :
                    booking.status === "pending" ? "pending" : "sold_out",
                features: booking.tickets.map(t => `${t.quantity}x Ticket ${t.ticketId}`),
                restrictions: [],
                daysIncluded: {
                    thursday: false,
                    friday: false,
                    saturday: false,
                    sunday: true
                },
                isChildTicket: false,
                resellerUrl: "#"
            }));
        },
        initialData: [],
    });

    if (isLoading || !tickets || tickets.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Available Tickets</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket: TicketInfo) => (
                    <Card key={ticket.title} className="p-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{ticket.title}</h4>
                                    <Badge
                                        variant={
                                            ticket.availability === "sold_out" ? "destructive" :
                                                ticket.availability === "low_stock" ? "default" : "secondary"
                                        }
                                    >
                                        {ticket.availability === "sold_out" ? "Sold Out" :
                                            ticket.availability === "low_stock" ? "Low Stock" :
                                                ticket.availability === "pending" ? "Coming Soon" : "Available"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {ticket.description}
                                </p>
                                <div className="text-lg font-semibold">
                                    {ticket.price}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium">Features:</h5>
                                <ul className="space-y-2">
                                    {ticket.features.map((feature: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button
                                className="w-full"
                                disabled={ticket.availability === "sold_out"}
                                onClick={() => window.open(ticket.resellerUrl, "_blank")}
                            >
                                Book Now
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
} 
```

## components/race/RaceHero.tsx

```tsx
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Timer } from "lucide-react";
import type { Race } from "@/types/race";

interface RaceHeroProps {
    /** The race data to display */
    race: Race;
    /** Callback when the Book Now button is clicked */
    onBookNow: () => void;
}

export function RaceHero({ race, onBookNow }: RaceHeroProps) {
    return (
        <div className="relative overflow-hidden rounded-lg border bg-card">
            <div className="relative aspect-[21/9] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white">
                                {race.name}
                            </h1>
                            <Badge
                                variant={
                                    race.availability === "sold_out" ? 'destructive' :
                                        race.availability === "low_stock" ? 'default' : 'secondary'
                                }
                            >
                                {race.availability === "sold_out" ? 'Sold Out' :
                                    race.availability === "low_stock" ? 'Low Stock' :
                                        race.availability === "pending" ? 'Coming Soon' : 'Available'}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{race.circuit}, {race.country}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Timer className="h-4 w-4" />
                                <span>{format(new Date(race.date), "MMMM d, yyyy")}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button
                                size="lg"
                                disabled={race.availability === "sold_out"}
                                onClick={onBookNow}
                            >
                                Book Now
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => window.location.href = `/races/${race.id}/itinerary`}
                            >
                                View Itinerary
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
```

## components/view/ViewSwitcher.tsx

```tsx
import { Button } from "@/components/ui/button";
import { Grid2X2, List, Map } from "lucide-react";
import { ViewType, VIEW_OPTIONS } from "@/types/view";

const iconMap = {
    grid: Grid2X2,
    list: List,
    map: Map,
} as const;

export interface ViewSwitcherProps {
    /** The currently active view type */
    activeView: ViewType;
    /** Callback when the view type is changed */
    onViewChange: (view: ViewType) => void;
}

export function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
    return (
        <div
            className="flex items-center gap-2"
            role="group"
            aria-label="View options"
        >
            {VIEW_OPTIONS.map((option) => {
                const Icon = iconMap[option.icon];
                return (
                    <Button
                        key={option.value}
                        variant={activeView === option.value ? "default" : "ghost"}
                        size="icon"
                        onClick={() => onViewChange(option.value)}
                        aria-label={option.label}
                        aria-pressed={activeView === option.value}
                        title={option.label}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                );
            })}
        </div>
    );
} 
```

## components/weather-schedule/index.tsx

```tsx
import * as React from 'react';
import type { Race } from '../../../../types/race';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { WeatherTab } from './WeatherTab';
import { ScheduleTab } from './ScheduleTab';

interface WeatherAndScheduleProps {
    race: Race;
}

export function WeatherAndSchedule({ race }: WeatherAndScheduleProps) {
    const [activeTab, setActiveTab] = React.useState('weather');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Race Information</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="weather">Weather</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    </TabsList>
                    <TabsContent value="weather" className="mt-6">
                        <WeatherTab
                            raceId={race.id.toString()}
                            isActive={activeTab === 'weather'}
                        />
                    </TabsContent>
                    <TabsContent value="schedule" className="mt-6">
                        <ScheduleTab
                            raceId={race.id.toString()}
                            isActive={activeTab === 'schedule'}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 
```

## components/weather-schedule/WeatherTab.tsx

```tsx
import { Cloud } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import type { WeatherTabProps } from '../../../../types/race';

export function WeatherTab({ raceId, isActive }: WeatherTabProps) {
    const { data: weather, isLoading } = useWeather(String(raceId), isActive);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!weather) {
        return (
            <div className="text-center text-muted-foreground">
                Weather data not available
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-[#E10600]" />
                    <span className="text-lg font-medium">
                        {weather.temperature}°C
                    </span>
                </div>
                <span className="text-muted-foreground">
                    {weather.conditions}
                </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Precipitation</p>
                    <p className="text-2xl font-bold mt-1">
                        {weather.precipitation}%
                    </p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Humidity</p>
                    <p className="text-2xl font-bold mt-1">
                        {weather.humidity}%
                    </p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Wind Speed</p>
                    <p className="text-2xl font-bold mt-1">
                        {weather.wind_speed} km/h
                    </p>
                </div>
            </div>
        </div>
    );
} 
```

## components/weather-schedule/WeatherAndSchedule.tsx

```tsx
import { Race } from "@/types/race";
import { WeatherCard } from "../weather/WeatherCard";
import { ScheduleCard } from "../schedule/ScheduleCard";
import { ErrorBoundary } from "react-error-boundary";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";

interface WeatherAndScheduleProps {
    /** The race data containing weather and schedule information */
    race: Race;
}

interface SectionProps {
    /** The race data containing weather and schedule information */
    race: Race;
}

function WeatherSection({ race }: SectionProps) {
    if (!race.weather_info) {
        return (
            <EmptyState
                icon="cloud"
                title="No Weather Data"
                description="Weather information is not available for this race yet."
            />
        );
    }

    return <WeatherCard raceId={race.id} />;
}

function ScheduleSection({ race }: SectionProps) {
    if (!race.schedule) {
        return (
            <EmptyState
                icon="calendar"
                title="No Schedule"
                description="Race schedule is not available yet."
            />
        );
    }

    return <ScheduleCard schedule={race.schedule} />;
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

export function WeatherAndSchedule({ race }: WeatherAndScheduleProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <ErrorBoundary FallbackComponent={FallbackComponent}>
                <WeatherSection race={race} />
            </ErrorBoundary>
            <ErrorBoundary FallbackComponent={FallbackComponent}>
                <ScheduleSection race={race} />
            </ErrorBoundary>
        </div>
    );
} 
```

## components/weather-schedule/ScheduleTab.tsx

```tsx
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useSchedule } from '../../hooks/useSchedule';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import type { ScheduleTabProps } from '../../../../types/race';

export function ScheduleTab({ raceId, isActive }: ScheduleTabProps) {
    const { data: schedule, isLoading } = useSchedule(String(raceId), isActive);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!schedule?.length) {
        return (
            <div className="text-center text-muted-foreground">
                Schedule not available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {schedule.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                >
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-[#E10600]" />
                        <div>
                            <p className="font-medium">{item.name || item.type}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(item.date), 'EEEE, MMMM d')}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm font-medium">{item.time}</p>
                </div>
            ))}
        </div>
    );
} 
```

## components/weather-schedule/index.ts

```ts
export { WeatherAndSchedule } from "./WeatherAndSchedule";

```

## components/weather/WeatherCard.tsx

```tsx
import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRaceWeather } from "@/lib/api/races";
import type { WeatherInfo } from "@/types/race";

interface WeatherCardProps {
    /** The ID of the race to fetch weather for */
    raceId: number;
    /** Optional pre-loaded weather information */
    weatherInfo?: WeatherInfo;
}

export function WeatherCard({ raceId, weatherInfo }: WeatherCardProps) {
    const { data: weather, isLoading } = useQuery<WeatherInfo>({
        queryKey: ["race-weather", raceId],
        queryFn: () => getRaceWeather(raceId),
        enabled: !weatherInfo,
        initialData: weatherInfo,
    });

    if (isLoading || !weather) {
        return null;
    }

    const getWeatherIcon = (conditions: string) => {
        switch (conditions.toLowerCase()) {
            case "cloudy":
                return <Cloud className="h-6 w-6" />;
            case "rainy":
                return <CloudRain className="h-6 w-6" />;
            case "sunny":
                return <Sun className="h-6 w-6" />;
            default:
                return <Sun className="h-6 w-6" />;
        }
    };

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <h3 className="font-semibold">Weather Forecast</h3>
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getWeatherIcon(weather.conditions)}
                            <span className="font-medium">{weather.conditions}</span>
                        </div>
                        <span className="text-2xl font-bold">
                            {weather.temperature}°C
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4" />
                            <span>Wind: {weather.wind_speed} km/h</span>
                        </div>
                        <div>Humidity: {weather.humidity}%</div>
                        <div>Precipitation: {weather.precipitation}%</div>
                        <div>Visibility: {weather.visibility || "N/A"}</div>
                        {weather.airTemperature && (
                            <div>Air Temp: {weather.airTemperature}°C</div>
                        )}
                        {weather.trackTemperature && (
                            <div>Track Temp: {weather.trackTemperature}°C</div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
} 
```

## components/weather/WeatherDetail.tsx

```tsx
import { cn } from "@/lib/utils";

interface WeatherDetailProps {
    /** The label for the weather detail */
    label: string;
    /** The value to display */
    value: string;
    /** Optional icon to display */
    icon?: string;
    /** Whether to highlight this detail */
    isHighlight?: boolean;
}

export function WeatherDetail({ label, value, icon, isHighlight }: WeatherDetailProps) {
    return (
        <div className="space-y-1">
            <p className={cn(
                "text-sm text-muted-foreground capitalize",
                isHighlight && "text-primary"
            )}>
                {label}
            </p>
            <p className={cn(
                "font-medium flex items-center gap-1",
                isHighlight && "text-primary"
            )}>
                {icon && <span>{icon}</span>}
                {value}
            </p>
        </div>
    );
} 
```

## components/hero/HeroSection.tsx

```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Race } from "@/types/race";
import { formatDate } from "@/lib/utils/date";

export interface HeroSectionProps {
    /** Callback when the View Details button is clicked */
    onViewDetails: () => void;
    /** The next upcoming race, if any */
    nextRace?: Race;
    /** Whether the race data is loading */
    isLoading?: boolean;
}

export function HeroSection({
    onViewDetails,
    nextRace,
    isLoading = false
}: HeroSectionProps) {
    return (
        <section
            className="space-y-6"
            aria-labelledby="hero-heading"
        >
            <div className="space-y-2">
                <h1
                    id="hero-heading"
                    className="text-3xl font-bold tracking-tight"
                >
                    F1 Race Calendar
                </h1>
                <p className="text-lg text-muted-foreground">
                    Browse and book tickets for upcoming Formula 1 races around the world.
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    onClick={onViewDetails}
                    disabled={isLoading || !nextRace}
                    aria-label={
                        nextRace
                            ? `View details for ${nextRace.name} on ${formatDate(nextRace.date)}`
                            : "No upcoming races available"
                    }
                >
                    View Next Race
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
                {nextRace && (
                    <p
                        className="text-sm text-muted-foreground"
                        aria-live="polite"
                    >
                        Next race: {nextRace.name} on {formatDate(nextRace.date)}
                    </p>
                )}
            </div>
            {isLoading && (
                <div
                    className="text-sm text-muted-foreground"
                    aria-live="polite"
                >
                    Loading race information...
                </div>
            )}
        </section>
    );
} 
```

## components/itinerary/RaceItinerary.tsx

```tsx
import * as React from "react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar } from "lucide-react";
import type { Race } from "@db/schema";

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

interface AttractionJson {
    id?: string | number;
    name?: string;
    description?: string;
    image_url?: string;
    distance?: string;
    type?: string;
}

interface Attraction {
    id: string;
    name: string;
    description: string;
    timeSlot?: string;
    image_url?: string;
    distance?: string;
    type?: string;
}

interface SavedItinerary {
    id: string;
    name: string;
    date: string;
    activities: Attraction[];
}

interface RaceItineraryProps {
    /** The race data containing local attractions */
    race: Race;
}

export function RaceItinerary({ race }: RaceItineraryProps) {
    const [activeTab, setActiveTab] = React.useState("create");
    const [selectedAttraction, setSelectedAttraction] = React.useState<Attraction | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string>("");
    const [savedItineraries, setSavedItineraries] = React.useState<SavedItinerary[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [newItineraryName, setNewItineraryName] = React.useState("");
    const [selectedDate, setSelectedDate] = React.useState("");
    const [editingItinerary, setEditingItinerary] = React.useState<SavedItinerary | null>(null);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [selectedActivities, setSelectedActivities] = React.useState<Attraction[]>([]);

    React.useEffect(() => {
        console.log('Fetching saved itineraries...');
        fetchSavedItineraries();
    }, []);

    const fetchSavedItineraries = async () => {
        try {
            const response = await api.get<SavedItinerary[]>('/api/itineraries');
            console.log('Fetched itineraries response:', response);
            setSavedItineraries(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Failed to fetch saved itineraries:', err);
            setSavedItineraries([]);
        }
    };

    const handleSaveItinerary = async () => {
        try {
            if (!newItineraryName.trim() || !selectedDate || selectedActivities.length === 0) {
                console.log('Validation failed:', {
                    name: newItineraryName.trim(),
                    date: selectedDate,
                    activitiesCount: selectedActivities.length
                });
                return;
            }

            // Parse and validate the date
            let dateObj;
            try {
                const [year, month, day] = selectedDate.split('-').map(Number);
                if (!year || !month || !day) {
                    throw new Error('Invalid date format');
                }

                // Create date object at noon UTC to avoid timezone issues
                dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

                if (isNaN(dateObj.getTime())) {
                    throw new Error('Invalid date value');
                }
            } catch (error) {
                console.error('Date validation error:', error);
                alert('Please enter a valid date');
                return;
            }

            const itineraryData = {
                name: newItineraryName.trim(),
                date: dateObj.toISOString(),
                activities: selectedActivities.map(activity => ({
                    ...activity,
                    timeSlot: activity.timeSlot || ''
                })),
                raceId: race.id
            };

            console.log('Saving itinerary with data:', itineraryData);

            const response = isEditMode && editingItinerary
                ? await api.put(`/api/itineraries/${editingItinerary.id}`, itineraryData)
                : await api.post('/api/itineraries', itineraryData);

            console.log('Save/Update itinerary response:', response);

            await fetchSavedItineraries();
            setNewItineraryName("");
            setSelectedDate("");
            setSelectedActivities([]);
            setIsDialogOpen(false);
            setIsEditMode(false);
            setEditingItinerary(null);
            setActiveTab("saved");
        } catch (err) {
            console.error('Failed to save itinerary:', err);
            alert(`Failed to ${isEditMode ? 'update' : 'save'} itinerary. Please try again.`);
        }
    };

    const handleDeleteItinerary = async (itineraryId: string) => {
        try {
            const response = await api.delete(`/api/itineraries/${itineraryId}`);
            console.log('Delete itinerary response:', response);
            await fetchSavedItineraries();
        } catch (err) {
            console.error('Failed to delete itinerary:', err);
            alert('Failed to delete itinerary. Please try again.');
        }
    };

    const handleEditItinerary = (itinerary: SavedItinerary) => {
        console.log('Editing itinerary:', itinerary);

        // Set edit mode and dialog state first
        setIsEditMode(true);
        setIsDialogOpen(true);

        // Set itinerary details
        setEditingItinerary(itinerary);
        setNewItineraryName(itinerary.name || "");
        setSelectedActivities(itinerary.activities || []);

        // Handle date formatting
        try {
            if (!itinerary.date) {
                console.log('No date provided in itinerary');
                setSelectedDate("");
                return;
            }

            console.log('Raw itinerary date:', itinerary.date);
            // Ensure we're working with a Date object
            const dateObj = new Date(itinerary.date);

            console.log('Parsed date object:', dateObj);

            if (isNaN(dateObj.getTime())) {
                console.error('Invalid date in itinerary:', itinerary.date);
                setSelectedDate("");
                return;
            }

            // Format date as YYYY-MM-DD, using UTC to avoid timezone issues
            const year = dateObj.getUTCFullYear();
            const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getUTCDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            console.log('Formatted date for input:', formattedDate);
            setSelectedDate(formattedDate);
        } catch (error) {
            console.error('Error formatting date:', error);
            setSelectedDate("");
        }
    };

    // Reset all form state when closing dialog
    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setNewItineraryName("");
            setSelectedDate("");
            if (!isEditMode) {
                setSelectedActivities([]);
            }
            setIsEditMode(false);
            setEditingItinerary(null);
        }
    };

    const handleAttractionSelect = (attraction: Attraction) => {
        console.log('Selected attraction:', attraction);
        setSelectedAttraction(attraction);
    };

    const handleAddToItinerary = () => {
        if (selectedAttraction && selectedTimeSlot) {
            console.log('Adding attraction to itinerary:', {
                attraction: selectedAttraction,
                timeSlot: selectedTimeSlot
            });
            setSelectedActivities(prev => [...prev, {
                ...selectedAttraction,
                timeSlot: selectedTimeSlot
            }]);
            setSelectedAttraction(null);
            setSelectedTimeSlot("");
        }
    };

    const handleRemoveActivity = (index: number) => {
        console.log('Removing activity at index:', index);
        setSelectedActivities(prev => prev.filter((_, i) => i !== index));
    };

    const localAttractions: Attraction[] = ((race.local_attractions || []) as JsonValue[]).map(attraction => {
        if (typeof attraction === 'object' && attraction !== null) {
            const attr = attraction as AttractionJson;
            return {
                id: String(attr.id || attr.name || ''),
                name: String(attr.name || ''),
                description: String(attr.description || ''),
                image_url: String(attr.image_url || ''),
                distance: String(attr.distance || ''),
                type: String(attr.type || '')
            };
        }
        return {
            id: String(attraction),
            name: String(attraction),
            description: '',
            image_url: '',
            distance: '',
            type: ''
        };
    });

    return (
        <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="create">Create Itinerary</TabsTrigger>
                    <TabsTrigger value="saved">Saved Itineraries</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <Card>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Local Attractions</h3>
                                    <ScrollArea className="h-[400px]">
                                        <div className="space-y-2">
                                            {localAttractions.map((attraction) => (
                                                <Card
                                                    key={attraction.id}
                                                    className={`cursor-pointer transition-colors ${selectedAttraction?.id === attraction.id ? 'bg-muted' : ''
                                                        }`}
                                                    onClick={() => handleAttractionSelect(attraction)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-medium">{attraction.name}</h4>
                                                                <p className="text-sm text-muted-foreground">{attraction.description}</p>
                                                            </div>
                                                            {attraction.distance && (
                                                                <Badge variant="outline">
                                                                    <MapPin className="w-3 h-3 mr-1" />
                                                                    {attraction.distance}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Selected Activities</h3>
                                    <div className="space-y-4">
                                        {selectedActivities.map((activity, index) => (
                                            <Card key={`${activity.id}-${index}`}>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium">{activity.name}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                <Clock className="w-3 h-3 inline mr-1" />
                                                                {activity.timeSlot}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveActivity(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {selectedAttraction && (
                                            <div className="space-y-2">
                                                <Label htmlFor="timeSlot">Select Time</Label>
                                                <Input
                                                    id="timeSlot"
                                                    type="time"
                                                    value={selectedTimeSlot}
                                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                                />
                                                <Button
                                                    onClick={handleAddToItinerary}
                                                    disabled={!selectedTimeSlot}
                                                    className="w-full"
                                                >
                                                    Add to Itinerary
                                                </Button>
                                            </div>
                                        )}

                                        {selectedActivities.length > 0 && (
                                            <Button
                                                onClick={() => setIsDialogOpen(true)}
                                                className="w-full"
                                            >
                                                Save Itinerary
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="saved">
                    <Card>
                        <CardContent>
                            <div className="space-y-4">
                                {savedItineraries.length === 0 ? (
                                    <p className="text-center text-muted-foreground">No saved itineraries</p>
                                ) : (
                                    savedItineraries.map((itinerary) => (
                                        <Card key={itinerary.id}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-medium">{itinerary.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            <Calendar className="w-3 h-3 inline mr-1" />
                                                            {new Date(itinerary.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditItinerary(itinerary)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteItinerary(itinerary.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {itinerary.activities.map((activity, index) => (
                                                        <div
                                                            key={`${activity.id}-${index}`}
                                                            className="flex justify-between items-center text-sm"
                                                        >
                                                            <span>{activity.name}</span>
                                                            <span className="text-muted-foreground">
                                                                {activity.timeSlot}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit' : 'Save'} Itinerary</DialogTitle>
                        <DialogDescription>
                            Enter a name and date for your itinerary
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="itineraryName">Itinerary Name</Label>
                            <Input
                                id="itineraryName"
                                value={newItineraryName}
                                onChange={(e) => setNewItineraryName(e.target.value)}
                                placeholder="e.g., Race Day Activities"
                            />
                        </div>
                        <div>
                            <Label htmlFor="itineraryDate">Date</Label>
                            <Input
                                id="itineraryDate"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleDialogClose(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveItinerary}>
                            {isEditMode ? 'Update' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
```

## components/travel/TravelGuide.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plane, Bus, Hotel, MapPin } from "lucide-react";
import type { Race } from "@/types/race";
import { Badge } from "@/components/ui/badge";

interface TravelGuideProps {
    /** The race data containing travel information */
    race: Race;
}

export function TravelGuide({ race }: TravelGuideProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Airports Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        Nearest Airports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {race.nearest_airports && race.nearest_airports.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Airport</TableHead>
                                    <TableHead className="text-right">Transfer Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {race.nearest_airports.map((airport, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {airport.code} - {airport.name}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-muted-foreground">{airport.transferTime}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-sm">Airport information not available</p>
                    )}
                </CardContent>
            </Card>

            {/* Transport Options */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bus className="h-5 w-5" />
                        Getting to the Circuit
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {race.transport_info ? (
                            <div className="grid gap-4">
                                {/* Public Transport */}
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h3 className="font-medium mb-2">Public Transport</h3>
                                    <div className="space-y-2">
                                        {race.transport_info.public?.options?.map((option, index) => (
                                            <p key={index}>{option}</p>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {race.transport_info.public?.description}
                                    </p>
                                </div>

                                {/* Parking */}
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h3 className="font-medium mb-2">Parking</h3>
                                    <div className="space-y-2">
                                        {race.transport_info.parking?.options?.map((option, index) => (
                                            <p key={index}>{option}</p>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {race.transport_info.parking?.description}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p>No transport information available.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Local Area */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Local Area Guide
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Attractions */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Local Attractions</h3>
                            {race.local_attractions && race.local_attractions.length > 0 && (
                                <div className="grid gap-4">
                                    {race.local_attractions.map((attraction, index) => (
                                        <div key={index} className="p-4 bg-muted/50 rounded-lg">
                                            <h3 className="font-medium mb-2">{attraction.name}</h3>
                                            <p className="text-sm text-muted-foreground">{attraction.description}</p>
                                            {attraction.distance && (
                                                <div className="mt-2 text-sm">
                                                    <span className="text-muted-foreground">Distance: </span>
                                                    {attraction.distance}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Accommodation */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Recommended Areas to Stay</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hotel className="h-4 w-4" />
                                        <span className="font-medium">City Center</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Close to restaurants and nightlife, 30min to circuit
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hotel className="h-4 w-4" />
                                        <span className="font-medium">Circuit Area</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Convenient for race weekend, limited amenities
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 
```

## components/session/SessionDetails.tsx

```tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchSessionDetails, fetchRaceHistory } from "@/lib/api";
import type { Race } from "@/types/race";

interface SessionDetailsProps {
    /** The race data */
    race: Race;
    /** The session key to fetch details for */
    sessionKey?: number;
}

interface SessionData {
    session: any;
    drivers: any;
}

interface RaceHistoryData {
    laps: any[];
    positions: any[];
    pitStops: any[];
}

export function SessionDetails({ race, sessionKey }: SessionDetailsProps) {
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [raceHistory, setRaceHistory] = useState<RaceHistoryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionKey) {
            const fetchData = async () => {
                try {
                    const [sessionDetails, history] = await Promise.all([
                        fetchSessionDetails(sessionKey),
                        fetchRaceHistory(sessionKey)
                    ]);
                    setSessionData(sessionDetails);
                    setRaceHistory(history);
                } catch (error) {
                    console.error("Error fetching session data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [sessionKey]);

    if (!sessionKey) {
        return null;
    }

    if (loading) {
        return <div>Loading session data...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>
                    {sessionData?.session?.sessionName} - {race.circuit}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="positions">
                    <TabsList>
                        <TabsTrigger value="positions">Positions</TabsTrigger>
                        <TabsTrigger value="pitstops">Pit Stops</TabsTrigger>
                        <TabsTrigger value="laptimes">Lap Times</TabsTrigger>
                    </TabsList>

                    <TabsContent value="positions">
                        <div className="space-y-4">
                            {raceHistory?.positions.map((pos) => (
                                <div key={`${pos.lap}-${pos.driverNumber}`} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">Lap {pos.lap}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Driver: {sessionData?.drivers.find((d: any) => d.driver_number === pos.driverNumber)?.full_name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">P{pos.position}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Gap: {pos.gapToLeader ? `+${pos.gapToLeader.toFixed(3)}s` : "Leader"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="pitstops">
                        <div className="space-y-4">
                            {raceHistory?.pitStops.map((pit) => (
                                <div key={`${pit.lap}-${pit.driverNumber}`} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">Lap {pit.lap}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Driver: {sessionData?.drivers.find((d: any) => d.driver_number === pit.driverNumber)?.full_name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{pit.duration.toFixed(3)}s</p>
                                        {pit.compound && (
                                            <p className="text-sm text-muted-foreground">Tire: {pit.compound}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="laptimes">
                        <div className="space-y-4">
                            {raceHistory?.laps.map((lap) => (
                                <div key={`${lap.lap_number}-${lap.driver_number}`} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">Lap {lap.lap_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Driver: {sessionData?.drivers.find((d: any) => d.driver_number === lap.driver_number)?.full_name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-medium">{lap.lap_duration?.toFixed(3)}s</p>
                                        {lap.is_pit_out_lap && (
                                            <p className="text-sm text-muted-foreground">Pit Out Lap</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 
```

## hooks/useWeather.ts

```ts
import { useQuery } from "@tanstack/react-query";
import type { WeatherData } from "../../../types/race";

async function fetchWeather(raceId: string): Promise<WeatherData> {
  const response = await fetch(`/api/races/${raceId}/weather`);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return response.json();
}

export function useWeather(raceId: string, enabled: boolean = true) {
  return useQuery<WeatherData, Error>({
    queryKey: ["weather", raceId],
    queryFn: () => fetchWeather(raceId),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

```

## hooks/useRaces.ts

```ts
import { useQuery } from "@tanstack/react-query";
import type { ClientRace } from "@shared/types/unified";

async function fetchRaces(): Promise<ClientRace[]> {
  const response = await fetch("/api/races");
  if (!response.ok) {
    throw new Error("Failed to fetch races");
  }
  const data = await response.json();
  return data.data;
}

export function useRaces() {
  return useQuery<ClientRace[], Error>({
    queryKey: ["races"],
    queryFn: fetchRaces,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

```

## hooks/useSchedule.ts

```ts
import { useQuery } from "@tanstack/react-query";
import type { ScheduleItem } from "../../../types/race";

async function fetchSchedule(raceId: string): Promise<ScheduleItem[]> {
  const response = await fetch(`/api/races/${raceId}/schedule`);
  if (!response.ok) {
    throw new Error("Failed to fetch schedule data");
  }
  const data = await response.json();
  return data.data;
}

export function useSchedule(raceId: string, enabled: boolean = true) {
  return useQuery<ScheduleItem[], Error>({
    queryKey: ["schedule", raceId],
    queryFn: () => fetchSchedule(raceId),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

```

