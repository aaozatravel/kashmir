const SUPABASE_URL = "https://yejnsszmvlnmkfqhyfdc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllam5zc3ptdmxubWtmcWh5ZmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzI2MTYsImV4cCI6MjA4OTkwODYxNn0.0hOShgfmb6NIITSzulKvIePerRa-ofLZ55TU-v3k6s8";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabaseClient;
