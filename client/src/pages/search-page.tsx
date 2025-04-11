import FlightSearch from '@/components/FlightSearch';
import { Helmet } from 'react-helmet';

export default function SearchPage() {
  return (
    <>
      <Helmet>
        <title>Search Flights, Airports & Aircraft | AeroTracker</title>
        <meta name="description" content="Search for real-time flight information, airport details, and aircraft data with AeroTracker's powerful aviation search." />
        <meta name="keywords" content="flight search, aircraft search, airport search, aviation search, flight tracker, AeroTracker" />
      </Helmet>
      <div className="container py-8">
        <FlightSearch />
      </div>
    </>
  );
}