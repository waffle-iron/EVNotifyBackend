var srv_config = require('./../../srv_config.json'),
    request = require('request');

/**
 * Function which retrieves list of stations based on given position and radius
 * @param  {Object}   latLng    Object containing latitude and longitude property
 * @param  {Integer}   radius   the radius to search for (in kilometres)
 * @param  {Function} callback  callback function
 * @return {void}
 */
function getStations(latLng, radius, callback) {
    request({
        uri: srv_config.GE_API_URL + '/chargepoints/' + srv_config.GE_API_KEY +
            '&lat=' + latLng.lat + '&lng=' + latLng.lng + '&radius=' + ((radius)? radius : 10) + '&orderby=distance',
        method: 'GET',
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(err, resp, body) {
        try {
            callback(err, ((err)? null : JSON.parse(body)));
        } catch (e) {
            callback(500, null);
        }
    });
}

/**
 * getStations request handler
 * @param  {ServerRequest} req  ServerRequest
 * @param  {ServerResponse} res ServerResponse
 * @return {ServerResponse}
 */
exports.getStations = function(req, res) {
    // check params
    if(typeof req.body !== 'undefined' && req.body.lat, req.body.lng) {
        getStations({lat: req.body.lat, lng: req.body.lng}, req.body.radius, function(err, stationRes) {
            res.json({err: err, stations: stationRes});
        });
    } else res.status(422).json({message: 'Missing parameters. Unable to handle request', error: 422});
};

/**
 * Function which retrieves detailed information for given station
 * @param  {Integer}   id       the station id
 * @param  {Function} callback  callback function
 * @return {void}
 */
function getStation(id, callback) {
    request({
        uri: srv_config.GE_API_URL + '/chargepoints/' + srv_config.GE_API_KEY + '&ge_id=' + id,
        method: 'GET',
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(err, resp, body) {
        try {
            callback(err, ((err)? null : JSON.parse(body)));
        } catch (e) {
            callback(500, null);
        }
    });
}

/**
 * getStation request handler
 * @param  {ServerRequest} req  ServerRequest
 * @param  {ServerResponse} res ServerResponse
 * @return {ServerResponse}
 */
exports.getStation = function(req, res) {
    // check params
    if(typeof req.body !== 'undefined' && req.body.id) {
        getStation(req.body.id, function(err, stationRes) {
            res.json({err: err, station: stationRes});
        });
    } else res.status(422).json({message: 'Missing parameters. Unable to handle request', error: 422});
};

/**
 * Function which retrieves and streams the station photo of given id
 * @param  {Integer} id         the station photo id to retrieve
 * @param  {ServerResponse} res the ServerResponse
 * @return {ServerResponse}
 */
function getStationPhoto(id, res) {
    request({
        uri: srv_config.GE_API_URL + '/chargepoints/photo/' + srv_config.GE_API_KEY + '&id=' + id,
        method: 'GET',
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10,
        headers: {'content-type': 'image/jpeg'}
    }).pipe(res);
}

/**
 * getStationPhoto request handler
 * @param  {ServerRequest} req  ServerRequest
 * @param  {ServerResponse} res ServerResponse
 * @return {ServerResponse}
 */
exports.getStationPhoto = function(req, res) {
    // check params
    if(typeof req.body !== 'undefined' && req.body.id) {
        getStationPhoto(req.body.id, res);
    } else res.status(422).json({message: 'Missing parameters. Unable to handle request', error: 422});
};

/**
 * Function which retrieves list of available chargings cards
 * @param  {Function} callback  callback function
 * @return {void}
 */
function getStationCards(callback) {
    request({
        uri: srv_config.GE_API_URL + '/chargepoints/chargecardlist/' + srv_config.GE_API_KEY,
        method: 'GET',
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(err, resp, body) {
        try {
            callback(err, ((err)? null : JSON.parse(body)));
        } catch (e) {
            callback(500, null);
        }
    });
}

/**
 * getStationCards request handler
 * @param  {ServerRequest} req  ServerRequest
 * @param  {ServerResponse} res ServerResponse
 * @return {ServerResponse}
 */
exports.getStationCards = function(req, res) {
    getStationCards(function(err, cardsRes) {
        res.json({err: err, cards: cardsRes});
    });
};
