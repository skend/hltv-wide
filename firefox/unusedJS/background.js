/* 
    no longer as i'm no longer embedding stuff 
    keeping it incase hltv.pro ever dies
*/

function requestProcessor(details) {
    for (var i = 0, iLen = rules.length; i !== iLen; ++i) {
        if (!rules[i][0].test(details.url)) {
            continue;
        }
        var subrules = rules[i][1];
        var headers = details.responseHeaders;
        for (var j = 0, jLen = headers.length; j !== jLen; ++j) {
            var header = headers[j];
            var name = header.name.toLowerCase();
            if (name !== "content-security-policy" &&
                name !== "x-webkit-csp") {
                continue;
            }
            for (var k = 0, kLen = subrules.length; k !== kLen; ++k) {
                header.value = header.value.replace(subrules[k][0],
                                                    subrules[k][1]);
            }
        }
        return {responseHeaders: headers};
    }
}

var rules = [ [ ["https://www.hltv.org", [
        ["script-src", "script-src https://api.imgur.com"],
        ["connect-src", "connect-src https://api.imgur.com"] ]] ] ]