class Offer {
    sdp = null;
    datetime = null;
    polite = null;
    constructor(sdp, datetime, polite) {
        this.sdp = sdp;
        this.datetime = datetime;
        this.polite = polite;
    }
}

module.exports = {
    Offer: Offer
}