//https://cdnjs.cloudflare.com/ajax/libs/openlocationcode/1.0.3/openlocationcode.min.js
//That's the src to import in html file to be able to use OpenLocationCode functions
//This type of OLC is based on coordinates, it would may be better to look for one that works with cities names
function getOLC(latitude, longitude) {
                val = OpenLocationCode.encode(latitude, longitude, OpenLocationCode.CODE_PRECISION_NORMAL)
                return val
            }
