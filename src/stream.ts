import { StartPosition, StartPositionMap } from '../grpc/generated/api_pb';
import { InvalidPartitionsError, OffsetNotSpecifiedError, TimestampNotSpecifiedError } from './errors';

/**
 * Liftbridge stream options.
 * @category Stream
 */
export interface ILiftbridgeStreamOptions {
    /**
     * Stream subject.
     */
    subject: string;
    /**
     * Unique stream name.
     */
    name: string;
    /**
     * Name of a load-balance group. When there are multiple
     * streams in the same group, messages will be balanced among them.
     */
    group?: string;
    /**
     * Controls the number of servers to replicate a stream to. For
     * example a value of `1` would mean only 1 server would have the data,
     * and a value of `3` would be 3 servers would have it. If this is not set, it
     * defaults to `1`. A value of `-1` will signal to the server to set the
     * replication factor equal to the current number of servers in the
     * cluster.
     */
    replicationFactor?: number;
    /**
     * Sets the stream replication factor equal
     * to the current number of servers in the cluster.
     */
    maxReplication?: boolean;
    /**
     * Use in [[subscribe]] when you want to read messages
     * from a particular offset.
     */
    startOffset?: number;
    /**
     * Use in [[subscribe]] when you want to read messages
     * from a particular timestamp. Timestamp has to be specified
     * as nanoseconds since UNIX epoch time.
     *
     * @example
     * ```
     * const startTimestamp = Date.now() * 1e6;
     * ```
     */
    startTimestamp?: number;
    /**
     * Control where to begin consuming from in the stream.
     * Available positions are `EARLIEST`, `LATEST`, `NEW_ONLY`,
     * `OFFSET` ([[startOffset]] has to be set) & `TIMESTAMP` ([[startTimestamp]] has to be set).
     *
     * 1. `EARLIEST` sets the subscription start position to the earliest message received in the stream.
     * 2. `LATEST` sets the subscription start position to the last message received in the stream.
     * 3. `NEW_ONLY` sets the subscription start position to the timestamp when the subscription began.
     * 4. `OFFSET` sets the subscription start position to a specific offset.
     * 5. `TIMESTAMP` sets the subscription start position to a specific timestamp.
     */
    startPosition?: StartPositionMap[keyof StartPositionMap];
    /**
     * Determines how many partitions to create for a stream. If `0`,
     * this will behave as a stream with a single partition. If this is not
     * set, it defaults to `1`.
     */
    partitions?: number;
}

/**
 * Liftbridge Stream.
 * Use to represent a Liftbridge stream in [[subscribe]] and [[createStream]] operations.
 *
 * @category Stream
 */
export default class LiftbridgeStream {
    /**
     * See [[ILiftbridgeStreamOptions.subject]]
     */
    public readonly subject: string;

    /**
     * See [[ILiftbridgeStreamOptions.name]]
     */
    public readonly name: string;

    /**
     * See [[ILiftbridgeStreamOptions.group]]
     */
    public readonly group: string | undefined;

    /**
     * See [[ILiftbridgeStreamOptions.replicationFactor]]
     */
    public readonly replicationFactor: number = 1;

    /**
     * See [[ILiftbridgeStreamOptions.startOffset]]
     */
    public readonly startOffset: number | undefined;

    /**
     * See [[ILiftbridgeStreamOptions.startTimestamp]]
     */
    public readonly startTimestamp: number | undefined;

    /**
     * See [[ILiftbridgeStreamOptions.startPosition]]
     */
    public readonly startPosition: StartPositionMap[keyof StartPositionMap] | undefined;

    /**
     * See [[ILiftbridgeStreamOptions.partitions]]
     */
    public partitions: number | undefined = 1;

    /**
     * Creates a Stream object.
     *
     * @param stream Stream options.
     */
    public constructor(stream: ILiftbridgeStreamOptions) {
        this.subject = stream.subject;
        this.name = stream.name;
        if (stream.group) this.group = stream.group;
        this.partitions = stream.partitions ? stream.partitions : 1;
        if (this.partitions < 0) {
            throw new InvalidPartitionsError();
        }
        if (stream.startPosition === StartPosition.OFFSET && !stream.startOffset) throw new OffsetNotSpecifiedError();
        if (stream.startPosition === StartPosition.TIMESTAMP && !stream.startTimestamp) throw new TimestampNotSpecifiedError();
        this.replicationFactor = stream.replicationFactor ? stream.replicationFactor : 1;
        this.replicationFactor = stream.maxReplication ? -1 : this.replicationFactor;
        if (stream.startOffset) this.startOffset = stream.startOffset;
        if (stream.startTimestamp) this.startTimestamp = stream.startTimestamp;
        if (!stream.startOffset && !this.startTimestamp && stream.startPosition) this.startPosition = stream.startPosition;
    }
}

export {
    StartPosition,
    StartPositionMap,
};
