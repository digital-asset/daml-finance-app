// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardActionArea, CardContent, Grid, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
// import { Box } from "@mui/system";
// import { Dex as DexContract } from "@daml.js/daml-finance-app/lib/DeFi/FlashSwap/Dex";
// import useStyles from "./styles";
// import { values } from "../../util";
// import { fmt } from "../../util";
// import { Holding } from "@daml.js/daml-finance-asset/lib/Daml/Finance/Asset/Holding";
// import { Spinner } from "../Spinner/Spinner";
// import { useStreamQueries } from "@daml/react";

// type DexProps = {
//   dex : DexContract
// }

// export const Dex : React.FC<DexProps> = ({ dex }) => {
//   const classes = useStyles();
//   const navigate = useNavigate()

//   const { contracts: tokens, loading: l1 } = useStreamQueries(Holding);
//   const token1 = tokens.find(c => c.contractId === dex.pool1.tokenCid);
//   const token2 = tokens.find(c => c.contractId === dex.pool2.tokenCid);

//   if (l1 || !token1 || !token2) return (<Spinner />);

//   return (
//     <Grid item xs={12} sm={6} md={4} lg={3}>
//       <Card className={classes.card}>
//         <Box border={1} borderColor="primary.main" style={{ height: "100%"}}>
//           <CardActionArea onClick={() => navigate(dex.id)}>
//             {/* <CardMedia className={classes.cardMedia} image={image} title={label} /> */}
//             <CardContent>
//               <Typography gutterBottom variant="h5" component="h2" className={classes.cardText}>{dex.pool1.issuableCid} / {dex.pool2.issuableCid}</Typography>
//               {/* <Typography variant="body2" color="textPrimary" component="p" className={classes.cardText}>{description}</Typography> */}
//               <Table size="small">
//                 <TableBody>
//                   <TableRow key={0} className={classes.tableRow}>
//                     <TableCell key={0} className={classes.tableCellMini}><b>Consortium</b></TableCell>
//                     <TableCell key={1} className={classes.tableCellMini}>{values(dex.consortium).join(", ")}</TableCell>
//                   </TableRow>
//                   <TableRow key={1} className={classes.tableRow}>
//                     <TableCell key={0} className={classes.tableCellMini}><b>Share Id</b></TableCell>
//                     <TableCell key={1} className={classes.tableCellMini}>{dex.share._2}</TableCell>
//                   </TableRow>
//                   <TableRow key={2} className={classes.tableRow}>
//                     <TableCell key={0} className={classes.tableCellMini}><b>Shares Issued</b></TableCell>
//                     <TableCell key={1} className={classes.tableCellMini} align="right">{fmt(dex.share._1)}</TableCell>
//                   </TableRow>
//                   <TableRow key={4} className={classes.tableRow}>
//                     <TableCell key={0} className={classes.tableCellMini}><b>{dex.pool1.issuableCid} Pool Size</b></TableCell>
//                     <TableCell key={1} className={classes.tableCellMini} align="right">{fmt(token1.payload.amount)}</TableCell>
//                   </TableRow>
//                   <TableRow key={5} className={classes.tableRow}>
//                     <TableCell key={0} className={classes.tableCellMini}><b>{dex.pool2.issuableCid} Pool Size</b></TableCell>
//                     <TableCell key={1} className={classes.tableCellMini} align="right">{fmt(token2.payload.amount)}</TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </CardActionArea>
//         </Box>
//       </Card>
//     </Grid>
//   );
// };
