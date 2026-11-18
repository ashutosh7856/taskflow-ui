import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import PrintRounded from "@mui/icons-material/PrintRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { api, errorMessage } from "../../lib/api";
import { formatMoney } from "../../lib/money";

export interface Receipt {
  id: string;
  number: string;
  status: "completed" | "refunded" | string;
  issuedAt: string;
  amount: number;
  currency: string;
  plan: string;
  interval: string | null;
  paymentMethod: string;
  reference: string;
  subscriptionId: string | null;
  customer: { name: string; email: string };
  seller: { name: string; website: string; email: string };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** A printable receipt. "Download PDF" uses the browser's Save as PDF. */
export function ReceiptPage() {
  const { id = "" } = useParams();
  const receipt = useQuery({
    queryKey: ["receipt", id],
    queryFn: async () =>
      (await api.get<Receipt>(`/billing/receipts/${id}`)).data,
  });
  useEffect(() => {
    if (receipt.data) document.title = `Receipt ${receipt.data.number} · Danto`;
  }, [receipt.data]);

  const data = receipt.data;
  const refunded = data?.status === "refunded";

  return (
    <Box className="receipt-page">
      <Stack
        direction="row"
        gap={1}
        flexWrap="wrap"
        className="receipt-actions"
        sx={{ maxWidth: 760, mx: "auto", mb: 2 }}
      >
        <Button
          component={Link}
          to="/billing"
          startIcon={<ArrowBackRounded />}
          color="inherit"
        >
          Back to billing
        </Button>
        <Box flex={1} />
        <Button
          variant="contained"
          startIcon={<PrintRounded />}
          disabled={!data}
          onClick={() => window.print()}
        >
          Print or save as PDF
        </Button>
      </Stack>

      <Box className="receipt-sheet">
        {receipt.isLoading && (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        )}
        {receipt.error && (
          <Alert severity="error">{errorMessage(receipt.error)}</Alert>
        )}
        {data && (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              gap={2}
            >
              <Box>
                <Brand />
                <Typography
                  fontSize={14}
                  color="text.secondary"
                  mt={1.5}
                  lineHeight={1.6}
                >
                  {data.seller.website}
                  <br />
                  {data.seller.email}
                </Typography>
              </Box>
              <Box sx={{ textAlign: { sm: "right" } }}>
                <Typography variant="h4" sx={{ fontSize: 30 }}>
                  {refunded ? "Refund receipt" : "Receipt"}
                </Typography>
                <Typography fontSize={14} color="text.secondary" mt={0.5}>
                  {data.number}
                </Typography>
                <Typography fontSize={14} color="text.secondary">
                  {formatDate(data.issuedAt)}
                </Typography>
              </Box>
            </Stack>

            <Box className="receipt-grid">
              <Box>
                <Typography className="receipt-label">Billed to</Typography>
                <Typography fontWeight={800}>{data.customer.name}</Typography>
                <Typography fontSize={14}>{data.customer.email}</Typography>
              </Box>
              <Box>
                <Typography className="receipt-label">Payment</Typography>
                <Typography fontSize={14}>
                  {refunded ? "Refunded to " : "Paid with "}
                  {data.paymentMethod}
                </Typography>
                <Typography
                  fontSize={13}
                  color="text.secondary"
                  sx={{ wordBreak: "break-all" }}
                >
                  Reference {data.reference}
                </Typography>
              </Box>
            </Box>

            <Box component="table" className="receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Danto {data.plan} plan
                    {data.interval
                      ? `, billed ${data.interval.toLowerCase()}`
                      : ""}
                    {data.subscriptionId && (
                      <Typography
                        component="span"
                        display="block"
                        fontSize={12}
                        color="text.secondary"
                      >
                        Subscription {data.subscriptionId}
                      </Typography>
                    )}
                  </td>
                  <td>{formatMoney(data.amount, data.currency)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>{refunded ? "Total refunded" : "Total paid"}</td>
                  <td>{formatMoney(data.amount, data.currency)}</td>
                </tr>
              </tfoot>
            </Box>

            <Typography
              fontSize={13}
              color="text.secondary"
              mt={4}
              lineHeight={1.6}
            >
              Thank you for using Danto. Questions about this charge? Email{" "}
              {data.seller.email} with the receipt number above.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
