
// Middleware to check if user has required role
exports.checkRole = (role) => {

    return (req, res, next) => {

        //get the token from the header if present
        let token = req.headers["x-access-token"] || req.headers["authorization"] || '';
        //if no token found, return response (without going to the next middelware)
        token = token.replace('Bearer ', '');


        if (!token) return res.status(404).json({
            message: 'No Token found',
            statusCode: 400,
            data: null,
            status: 'NOT OK'
        });

        require("jsonwebtoken").verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    message: 'Failed to authenticate token.', statusCode: 403,
                    data: null,
                    status: 'NOT OK'
                });
            }

            if (decoded.service_user != role) {
                return res.status(403).json({
                    message: 'You do not have permission to access this resource.', statusCode: 403,
                    data: null,
                    status: 'NOT OK'
                });
            }

            req.user = decoded;

            req.token = token;

            next();
        });
    };
}

// Middleware to check if user has required role
exports.checkManyRole = (roles) => {

    return (req, res, next) => {

        //get the token from the header if present
        let token = req.headers["x-access-token"] || req.headers["authorization"] || '';
        //if no token found, return response (without going to the next middelware)
        token = token.replace('Bearer ', '');


        if (!token) return res.status(404).json({
            message: 'No Token found',
            statusCode: 400,
            data: null,
            status: 'NOT OK'
        });

        require("jsonwebtoken").verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    message: 'Failed to authenticate token.', statusCode: 403,
                    data: null,
                    status: 'NOT OK'
                });
            }

            if (roles.indexOf(decoded.role_user) == -1) {
                return res.status(403).json({
                    message: 'You do not have permission to access this resource.', statusCode: 403,
                    data: null,
                    status: 'NOT OK'
                });
            }

            req.user = decoded;

            req.token = token;

            next();
        });
    };
}