class Candidate {
    candidate = null;
    sdpMLineIndex = null;
    sdpMid = null;
    datetime = null;
    constructor(candidate, sdpMLineIndex, sdpMid, datetime) {
        this.candidate = candidate;
        this.sdpMLineIndex = sdpMLineIndex;
        this.sdpMid = sdpMid;
        this.datetime = datetime;
    }
}

module.exports = {
    Candidate: Candidate
}