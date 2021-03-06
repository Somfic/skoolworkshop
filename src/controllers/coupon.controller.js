const logger = require('../config/config').logger;
const assert = require('assert');
const connection = require('../config/database.connection');

let controller = {
    validateCoupon(req, res, next) {
        logger.info('validatecoupon called', req.body);
        try {
            const {
                codeCoupon,
                valueCoupon,
                maxGebruikCoupon,
                Organisatie
            } = req.body;
            assert(typeof codeCoupon === 'string', 'Code is missing.');
            assert(typeof valueCoupon === 'string', 'Value is missing.');
            assert(typeof Organisatie === 'string', 'Organisatie is missing.');

            assert(
                typeof maxGebruikCoupon === 'string',
                'Max uses is missing.'
            );

            next();
        } catch (err) {
            logger.debug('Error', err);
            res.status(400).json({
                message: 'Error adding coupon!',
                error: err.message
            });
        }
    },

    createCoupon(req, res, next) {
        logger.info('createcoupon called');
        const coupon = req.body;
        let {
            codeCoupon,
            valueCoupon,
            maxBedragCoupon,
            maxGebruikCoupon,
            Organisatie
        } = coupon;
        logger.debug('coupon =', coupon);

        let sqlQuery =
            'INSERT INTO `Cadeaubon` (`Code`, `Value`, `MaxBedrag`, `MaxGebruik`, `AantalGebruikt`, `OrganisatieNaam`) VALUES (?, ?, ?, ?, 0, ?)';
        logger.debug('createcoupon', 'sqlQuery =', sqlQuery);

        connection.connectDatabase(
            sqlQuery, [
                codeCoupon,
                valueCoupon,
                maxBedragCoupon,
                maxGebruikCoupon,
                Organisatie
            ],
            (error, results, fields) => {
                if (error) {
                    logger.debug('createcoupon', error);
                    res.status(400).json({
                        message: 'coupon already exists!'
                    });
                }
                if (results) {
                    logger.debug('results: ', results);
                    res.status(200).json({
                        result: {
                            ...coupon
                        }
                    });
                }
            }
        );
    },

    checkDatabase(req, res, next) {
        logger.info('checkDatabase called');
        const couponID = req.params.ID;

        let sqlQuery = `SELECT ID FROM Cadeaubon WHERE ID = ?`;
        logger.debug('checkDatabase', 'sqlQuery = ', sqlQuery);

        connection.connectDatabase(
            sqlQuery,
            couponID,
            (error, results, fields) => {
                if (error) {
                    logger.debug('checkDatabase', 'Coupon not found');
                    res.status(400).json({
                        message: 'coupon not found'
                    });
                } else {
                    logger.debug('checkDatabase', 'Coupon found');
                    next();
                }
            }
        );
    },
    // Check of coupon in db staat

    deleteCoupon(req, res, next) {
        logger.info('deletecoupon called');
        const ID = req.params.ID;

        let sqlQuery = `DELETE FROM Cadeaubon WHERE ID = ?`;
        logger.debug('deletecoupon', 'sqlQuery =', sqlQuery);

        connection.connectDatabase(sqlQuery, ID, (error, results, fields) => {
            if (error) {
                console.log('deletecoupon', error);
                res.status(400).json({
                    message: 'deletecoupon failed',
                    error: error
                });
            } else {
                res.status(200).json({
                    message: 'coupon succesfully deleted!'
                });
            }
        });
    },

    checkValidCoupon(req, res, next) {
        logger.info('checkValidCoupon called');
        const couponCode = req.params.Code;

        let sqlQuery = `SELECT MaxGebruik, AantalGebruikt FROM Cadeaubon WHERE Code = ?;`;
        logger.debug('checkValidCoupon', 'sqlQuery = ', sqlQuery);

        connection.connectDatabase(
            sqlQuery,
            couponCode,
            (error, results, fields) => {
                if (error) {
                    console.log('checkValidCoupon ', error);
                    res.status(400).json({
                        message: 'checkValidCoupon failed',
                        error: error
                    });
                } else {
                    console.log(results);
                    for (var i = 0; i < 1; i++) {
                        logger.debug('parsedJSON: ', results[i]);
                        const MaxGebruik = results[i].MaxGebruik;
                        const AantalGebruikt = results[i].AantalGebruikt;
                        if (AantalGebruikt < MaxGebruik) {
                            next();
                        } else {
                            res.status(200).json({
                                message: 'Coupon is invalid'
                            });
                        }
                    }
                }
            }
        );
    },

    getOne(couponCode, callback) {
        logger.info('getOne called');

        const query = `SELECT Code, Value, MaxBedrag, MaxGebruik, AantalGebruikt FROM Cadeaubon WHERE Code = ?;`;

        logger.info('getOne:', couponCode);

        connection.connectDatabase(
            query,
            couponCode,
            (error, results, fields) => {
                if (error) {
                    logger.debug(couponCode, query, error);
                    callback('coupon does not exist!');
                } else {
                    logger.debug('results: ', results[0]);
                    callback(results);
                }
            }
        );
    },

    getAll(req, res, next) {
        const query = 'SELECT * FROM Cadeaubon ORDER BY OrganisatieNaam;';

        connection.connectDatabase(query, (error, results, fields) => {
            if (error) {
                logger.debug('getAll', query);
                res.status(400).json({
                    error: error
                });
            } else if (results.length == 0) {
                res.status(404).json({
                    message: 'There are no coupons!'
                });
            } else {
                res.status(200).json({
                    Result: results
                });
            }
        });
    },

    checkValue(req, res, next) {
        logger.info('checkValue called');
        const couponCode = req.params.Code;
        const workshop = req.params.Workshop;
        logger.debug('Couponcode: ', couponCode, 'Workshop', workshop);
        let getOneResults;
        controller.getOne(couponCode, (results) => {
            getOneResults = results[0];
            const couponValue = getOneResults.Value;
            logger.debug('couponValue: ', couponValue);
            req.coupon = getOneResults;
            req.workshop = workshop;
            let valueString;

            if (
                couponValue.charAt(couponValue.length - 1) == 0 ||
                couponValue.charAt(couponValue.length - 1) == 1 ||
                couponValue.charAt(couponValue.length - 1) == 2 ||
                couponValue.charAt(couponValue.length - 1) == 3 ||
                couponValue.charAt(couponValue.length - 1) == 4 ||
                couponValue.charAt(couponValue.length - 1) == 5 ||
                couponValue.charAt(couponValue.length - 1) == 6 ||
                couponValue.charAt(couponValue.length - 1) == 7 ||
                couponValue.charAt(couponValue.length - 1) == 8 ||
                couponValue.charAt(couponValue.length - 1) == 9
            ) {
                valueString = 'Money';
                req.valueString = valueString;
                logger.debug('req.valueString: ', req.valueString);
                next();
            } else if (
                couponValue.endsWith('%') &&
                (getOneResults.maxBedragCoupon != undefined ||
                    getOneResults.maxBedragCoupon != null ||
                    getOneResults.maxBedragCoupon != 0)
            ) {
                valueString = 'PercentageMax';
                req.valueString = valueString;
                logger.debug(valueString);
                next();
            } else if (
                couponValue.endsWith('%') &&
                (getOneResults.maxBedragCoupon == undefined ||
                    getOneResults.maxBedragCoupon == null ||
                    getOneResults.maxBedragCoupon == 0)
            ) {
                valueString = 'Percentage';
                req.valueString = valueString;
                logger.debug(valueString);
                next();
            } else if (couponValue == 'workshop' || couponValue == 'Workshop') {
                valueString = 'Workshop';
                req.valueString = valueString;
                logger.debug(valueString);
                next();
            }
        });
    },

    updateCoupon(couponCode, callback) {
        logger.info('updateCoupon called');

        let getOneResults;
        controller.getOne(couponCode, (results) => {
            logger.debug('results: ', results);
            getOneResults = results[0];
            let couponAantalGebruikt = getOneResults.AantalGebruikt;

            couponAantalGebruikt += 1;

            const query = `UPDATE Cadeaubon SET AantalGebruikt = ? WHERE Code = ?;`;

            connection.connectDatabase(
                query, [couponAantalGebruikt, couponCode],
                (error, results, fields) => {
                    if (error) {
                        logger.debug(couponCode, query, error);
                        callback('Error: ', error);
                    } else {
                        logger.debug('results: ', results);
                        callback('Coupon updated, result: ', results);
                    }
                }
            );
        });
    },

    workshopCouponHandler(req, res, next) {
        logger.info('workshopCouponHandler called');
        const valueString = req.valueString;
        if (valueString !== 'Workshop') {
            next();
        } else {
            const coupon = req.coupon;
            const couponCode = req.params.Code;
            const workshop = req.workshop;
            let Korting;
            logger.debug('coupon: ', coupon, 'Workshop: ', workshop);

            const query = `SELECT Kosten FROM Workshop WHERE Naam = ?;`;
            connection.connectDatabase(
                query,
                workshop,
                (error, results, fields) => {
                    if (error) {
                        logger.debug(couponCode, query, error);
                        res.status(400).json({
                            message: "Workshop doesn't exist",
                            error: error
                        });
                    } else {
                        logger.debug('Result: ', results);
                        Korting = results[0].Kosten;

                        controller.updateCoupon(couponCode, (results) => {});
                        res.status(200).json({
                            korting: Korting,
                            message: 'Coupon succesfully used!'
                        });
                    }
                }
            );
        }
    },

    moneyCouponHandler(req, res, next) {
        logger.info('moneyCouponHandler called');
        const valueString = req.valueString;
        if (valueString != 'Money') {
            next();
        } else {
            const couponCode = req.params.Code;

            let getOneResults;
            controller.getOne(couponCode, (results) => {
                logger.debug('results: ', results);
                getOneResults = results[0];
                let Korting = getOneResults.Value;

                controller.updateCoupon(couponCode, (results) => {});

                res.status(200).json({
                    message: 'Coupon succesfully used!',
                    Korting: Korting
                });
            });
        }
    },

    percentageCouponHandler(req, res, next) {
        logger.info('percentageCouponHandler called');
        const valueString = req.valueString;
        if (valueString !== 'Percentage') {
            next();
        } else {
            const coupon = req.coupon;
            const couponCode = req.params.Code;
            const workshop = req.workshop;
            let Kosten;
            logger.debug('coupon: ', coupon, 'Workshop: ', workshop);

            const query = `SELECT Kosten FROM Workshop WHERE Naam = ?;`;
            connection.connectDatabase(
                query,
                workshop,
                (error, results, fields) => {
                    if (error) {
                        logger.debug(couponCode, query, error);
                        res.status(400).json({
                            message: "Workshop doesn't exist",
                            error: error
                        });
                    } else {
                        let workshopPrice = results[0].Kosten;

                        let Korting = coupon.Value.substring(
                            0,
                            coupon.Value.length - 1
                        );
                        logger.debug('Korting: ', Korting);

                        totaalKorting = (workshopPrice / 100) * Korting;
                        logger.debug('Totaalkorting: ', totaalKorting);

                        controller.updateCoupon(couponCode, (results) => {});

                        res.status(200).json({
                            message: 'Coupon succesfully used!',
                            Korting: totaalKorting
                        });
                    }
                }
            );
        }
    },

    percentageMaxCouponHandler(req, res, next) {
        logger.info('percentageMaxCouponHandler called');
        const valueString = req.valueString;
        if (valueString !== 'PercentageMax') {
            res.status(400).json({
                message: 'Error, invalid coupon type'
            });
        } else {
            const coupon = req.coupon;
            const couponCode = req.params.Code;
            const workshop = req.workshop;
            let Kosten;
            logger.debug('coupon: ', coupon, 'Workshop: ', workshop);

            const query = `SELECT Kosten FROM Workshop WHERE Naam = ?;`;
            connection.connectDatabase(
                query,
                workshop,
                (error, results, fields) => {
                    if (error) {
                        logger.debug(couponCode, query, error);
                        res.status(400).json({
                            message: "Workshop doesn't exist",
                            error: error
                        });
                    } else {
                        let workshopPrice = results[0].Kosten;

                        let Korting = coupon.Value.substring(
                            0,
                            coupon.Value.length - 1
                        );
                        const maxBedrag = coupon.MaxBedrag;
                        logger.debug('maxBedrag: ', maxBedrag);
                        logger.debug('Korting: ', Korting);

                        totaalKorting = (workshopPrice / 100) * Korting;
                        logger.debug('Totaalkorting: ', totaalKorting);

                        controller.updateCoupon(couponCode, (results) => {});
                        if (totaalKorting > maxBedrag) {
                            res.status(200).json({
                                message: 'Coupon succesfully used!',
                                Korting: maxBedrag
                            });
                        } else {
                            res.status(200).json({
                                message: 'Coupon succesfully used!',
                                Korting: totaalKorting
                            });
                        }
                    }
                }
            );
        }
    }
};

module.exports = controller;