
const uid = require('uid');
const path = require('path');
const fs = require('fs');
const { Console } = require('console');

const reader = require('xlsx')

exports.base64 = async (base) => {

    

    if (base === undefined) {
        return false;
    } else {
            // to declare some path to store your converted image
            // const matches = base.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            const regex = /^data:(.+)\?(.+);base64,(.+)$/;
            const matches = base.match(regex);
            response = {};
            


        if (matches.length !== 4) {
            return new Error('Invalid input string');
        }

        response.type = matches[2];

        response.data = Buffer.from(matches[3], 'base64');

        let decodedImg = response;


        let imageBuffer = decodedImg.data;

        let type = decodedImg.type;




        let fileName = matches[1].replace(/\s/g, '');


        fs.writeFileSync(path.join(__dirname, '..', 'uploads', fileName + '.jpg'), imageBuffer, 'utf8');

        const stats = fs.statSync(path.join(__dirname, '..', 'uploads', fileName +'.jpg' ));
        const fileSizeInBytes = stats.size / (1024 * 1024);


        if (fileSizeInBytes > 5) {

            fs.unlinkSync(path.join(__dirname, '..', 'uploads', fileName ));
            return 'File to large';

        } else {
            return {
                'url': `${fileName}.jpg`,
                'type': type
            };
        }




    }

}