# Description:
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#
# Notes:
#
# Author:


module.exports = (robot) ->
  robot.respond /persona/i, (msg) ->
    msg.send "JoSi Access - Loaded"