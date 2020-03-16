import Icon from '@material-ui/core/Icon';
import React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

const popover = (
  <Popover>
    <Popover.Title as="h3">Why is this helpful?</Popover.Title>
    <Popover.Content>
      We want to properly and accurately attribute each quote. Beyond that, this information allows us to provide functionalities such as looking up all the quotes of a particular person. It is difficult to program a computer to automatically extract who is quoted from the quotes themselves, so we have to rely on you to make this happen. 
    </Popover.Content>
  </Popover>
);

const TagPopover = () => (
  <OverlayTrigger trigger="click" placement="right" overlay={popover}>
    <Button variant="link" style={{padding: 0, paddingLeft: '5px'}} ><Icon>help_outline</Icon></Button>
  </OverlayTrigger>
)

export default TagPopover