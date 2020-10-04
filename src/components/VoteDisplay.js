import { FormatQuoteTwoTone } from '@material-ui/icons';
import React from 'react'
import { Card } from 'react-bootstrap'

const VoteDisplay = ({votes, profile}) => {
    if(profile && profile.isModerator){
        return (<card>
            Votes:
            <br />
            {votes.map(vote => vote.vote)}
        </card>)
    } else {
        return null;
    }
}

export default VoteDisplay