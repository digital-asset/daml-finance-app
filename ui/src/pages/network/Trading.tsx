import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableRow, TableHead, Button, Grid, Paper, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { CreateEvent } from "@daml/ledger";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Service, Request, Offer } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Trading/Service";
import useStyles from "../styles";
import { getName, getParty, getTemplateId } from "../../util";
import { InputDialog, InputDialogProps } from "../../components/InputDialog/InputDialog";
import { Role } from "@daml.js/daml-finance-app/lib/Daml/Finance/App/Role/Exchange";
import { partyIds } from "../../config";

export const Trading : React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const party = useParty();
  const ledger = useLedger();

  const parties = Object.keys(partyIds);
  const roles = useStreamQueries(Role).contracts;
  const hasRole = roles.length > 0 && roles[0].payload.provider === party;
  const services = useStreamQueries(Service).contracts;
  const requests = useStreamQueries(Request).contracts;
  const offers = useStreamQueries(Offer).contracts;

  // Service offer
  const defaultOfferDialogProps : InputDialogProps<any> = {
    open: false,
    title: "Request Offer Service",
    defaultValue: { client: "" },
    fields: { client: { label: "Client", type: "selection", items: parties } },
    onClose: async function(state : any | null) {}
  };
  const [offerDialogProps, setOfferDialogProps] = useState<InputDialogProps<any>>(defaultOfferDialogProps);

  const offerService = () => {
    const onClose = async (state : any | null) => {
      setOfferDialogProps({ ...defaultRequestDialogProps, open: false });
      if (!state || !hasRole) return;
      await ledger.exercise(Role.OfferTradingService, roles[0].contractId, { customer: getParty(state.customer), instructableCid: "" as any});
    };
    setOfferDialogProps({ ...defaultOfferDialogProps, open: true, onClose });
  };

  // Service request
  const defaultRequestDialogProps : InputDialogProps<any> = {
    open: false,
    title: "Request Trading Service",
    defaultValue: { provider: "" },
    fields: {
      provider: { label: "Provider", type: "selection", items: parties },
    },
    onClose: async function(state : any | null) {}
  };
  const [requestDialogProps, setRequestDialogProps] = useState<InputDialogProps<any>>(defaultRequestDialogProps);

  const requestService = () => {
    const onClose = async (state : any | null) => {
      setRequestDialogProps({ ...defaultRequestDialogProps, open: false });
      if (!state) return;
      await ledger.create(Request, { provider: getParty(state.provider), customer: party });
    };
    setRequestDialogProps({ ...defaultRequestDialogProps, open: true, onClose });
  };

  const acceptOffer = async (c : CreateEvent<Offer>) => {
    await ledger.exercise(Offer.Accept, c.contractId, {});
  }

  const terminateService = async (c : CreateEvent<Service>) => {
    await ledger.exercise(Service.Terminate, c.contractId, { actor: party });
  };

  const approveRequest = async (c : CreateEvent<Request>) => {
    if (!hasRole) return;
    await ledger.exercise(Role.ApproveTradingServiceRequest, roles[0].contractId, { tradingRequestCid: c.contractId, instructableCid: "" as any });
  }

  const cancelRequest = async (c : CreateEvent<Request>) => {
    await ledger.exercise(Request.Cancel, c.contractId, {});
  }

  const withdrawOffer = async (c : CreateEvent<Offer>) => {
    await ledger.exercise(Offer.Withdraw, c.contractId, { });
  }

  return (
    <>
      <InputDialog { ...requestDialogProps } />
      <InputDialog { ...offerDialogProps } />
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Actions</Typography></Grid>
              <Grid container direction="row" justifyContent="center">
                <Grid item xs={6}>
                  <Grid container justifyContent="center">
                    <Button color="primary" size="large" className={classes.actionButton} variant="outlined" onClick={requestService}>Request Trading Service</Button>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container justifyContent="center">
                    {hasRole && <Button color="primary" size="large" className={classes.actionButton} variant="outlined" onClick={offerService}>Offer Trading Service</Button>}
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Services</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Service</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Operator</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Provider</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Consumer</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Role</b></TableCell>
                    <TableCell key={7} className={classes.tableCell}><b>Action</b></TableCell>
                    <TableCell key={8} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getTemplateId(c.templateId)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.operator)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>{party === c.payload.provider ? "Provider" : "Consumer"}</TableCell>
                      <TableCell key={7} className={classes.tableCell}>
                        <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => terminateService(c)}>Terminate</Button>
                      </TableCell>
                      <TableCell key={8} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/network/trading/service/" + c.contractId)}>
                          <KeyboardArrowRight fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
      </Grid>
      <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Requests</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Service</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Provider</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Consumer</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Role</b></TableCell>
                    <TableCell key={6} className={classes.tableCell}><b>Action</b></TableCell>
                    <TableCell key={7} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getTemplateId(c.templateId)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{party === c.payload.provider ? "Provider" : "Consumer"}</TableCell>
                      <TableCell key={6} className={classes.tableCell}>
                        {c.payload.customer === party && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => cancelRequest(c)}>Cancel</Button>}
                        {c.payload.provider === party && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => approveRequest(c)}>Approve</Button>}
                      </TableCell>
                      <TableCell key={7} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/network/trading/request/" + c.contractId)}>
                          <KeyboardArrowRight fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
      </Grid>
      <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container direction="row" justifyContent="center" className={classes.paperHeading}><Typography variant="h2">Offers</Typography></Grid>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell key={0} className={classes.tableCell}><b>Service</b></TableCell>
                    <TableCell key={1} className={classes.tableCell}><b>Provider</b></TableCell>
                    <TableCell key={2} className={classes.tableCell}><b>Consumer</b></TableCell>
                    <TableCell key={3} className={classes.tableCell}><b>Role</b></TableCell>
                    <TableCell key={4} className={classes.tableCell}><b>Action</b></TableCell>
                    <TableCell key={5} className={classes.tableCell}><b>Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offers.map((c, i) => (
                    <TableRow key={i} className={classes.tableRow}>
                      <TableCell key={0} className={classes.tableCell}>{getTemplateId(c.templateId)}</TableCell>
                      <TableCell key={1} className={classes.tableCell}>{getName(c.payload.provider)}</TableCell>
                      <TableCell key={2} className={classes.tableCell}>{getName(c.payload.customer)}</TableCell>
                      <TableCell key={3} className={classes.tableCell}>{party === c.payload.provider ? "Provider" : "Consumer"}</TableCell>
                      <TableCell key={4} className={classes.tableCell}>
                        {c.payload.provider === party && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => withdrawOffer(c)}>Withdraw</Button>}
                        {c.payload.customer === party && <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => acceptOffer(c)}>Accept</Button>}
                      </TableCell>
                      <TableCell key={5} className={classes.tableCell}>
                        <IconButton color="primary" size="small" component="span" onClick={() => navigate("/network/trading/offer/" + c.contractId)}>
                          <KeyboardArrowRight fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
