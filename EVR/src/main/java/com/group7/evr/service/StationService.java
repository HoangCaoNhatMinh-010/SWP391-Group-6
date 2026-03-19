package com.group7.evr.service;

import com.group7.evr.entity.Station;

import java.util.List;
import java.util.Map;

public interface StationService {
    List<Station> getAllStations();

    List<Station> getNearbyStations(Double lat, Double lng, Double radiusDeg);

    Station createStation(Station station);

    Station updateStation(Integer stationId, Station stationUpdates);

    Map<String, Object> deleteStation(Integer stationId);
    
    void recalculateStationSlots(Integer stationId);
}
