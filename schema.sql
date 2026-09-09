-- PostgreSQL Schema for SIH26035 OIML R-76 NAWI Application

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: instruments
-- Stores metadata about the Non-Automatic Weighing Instruments
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manufacturer VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    accuracy_class VARCHAR(10) CHECK (accuracy_class IN ('I', 'II', 'III', 'IIII')),
    max_capacity NUMERIC NOT NULL,
    min_capacity NUMERIC NOT NULL,
    verification_scale_interval_e NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: test_sessions
-- Logs testing conditions for a specific test run
CREATE TABLE test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
    inspector_name VARCHAR(255) NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    temperature NUMERIC, -- in Celsius
    humidity NUMERIC, -- percentage
    barometric_pressure NUMERIC, -- in hPa
    status VARCHAR(50) DEFAULT 'IN_PROGRESS'
);

-- Table: weighing_tests
-- Stores individual load test data and calculated results (The core of OIML R-76 testing)
CREATE TABLE weighing_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
    applied_load_l NUMERIC NOT NULL,
    indication_i NUMERIC NOT NULL,
    additional_load_dl NUMERIC NOT NULL,
    zero_error_e0 NUMERIC DEFAULT 0,
    
    -- Calculated Fields (stored for audit purposes)
    calculated_p NUMERIC NOT NULL, -- Indication before rounding
    calculated_error_e NUMERIC NOT NULL, 
    corrected_error_ec NUMERIC NOT NULL,
    mpe_allowed NUMERIC NOT NULL,
    
    result VARCHAR(10) CHECK (result IN ('PASS', 'FAIL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Example Data Insertion
INSERT INTO instruments (manufacturer, model, serial_number, accuracy_class, max_capacity, min_capacity, verification_scale_interval_e)
VALUES ('Mettler Toledo', 'ME204', 'SN-2026-001', 'I', 220, 0.01, 0.001);
